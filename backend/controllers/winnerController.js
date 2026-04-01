const { z } = require("zod");
const { supabase } = require("../config/db");
const AppError = require("../utils/AppError");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");
const { sendEmail } = require("../utils/emailService");
const { winnerPaidEmail, winnerRejectedEmail } = require("../utils/emailTemplates");

const proofSchema = z.object({
  winnerId: z.string().uuid(),
  proofImageUrl: z.string().url().optional()
});

const reviewSchema = z.object({
  status: z.enum(["pending", "paid", "rejected"]) // matching schema.sql status check
});

async function listWinners(req, res, next) {
  try {
    let query = supabase
      .from("winners")
      .select("*, users (name, email), draws (month, winning_numbers, type, status)")
      .order("created_at", { ascending: false });
    
    if (req.user.role !== "admin") {
      query = query.eq("user_id", req.user.id);
    }

    const { data: winners, error } = await query;
    if (error) throw new AppError(error.message, 500);

    res.status(200).json({ winners });
  } catch (error) {
    next(error);
  }
}

async function uploadProof(req, res, next) {
  try {
    const { winnerId, proofImageUrl } = proofSchema.parse(req.body);
    const { data: winner } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .maybeSingle();

    if (!winner) throw new AppError("Winner record not found", 404);
    if (winner.user_id !== req.user.id) throw new AppError("Not allowed", 403);

    let uploadedUrl = null;
    if (req.file) {
      if (!isCloudinaryConfigured) throw new AppError("Cloudinary is not configured", 500);

      const base64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "golf-platform/winner-proofs",
        resource_type: "image"
      });
      uploadedUrl = uploadResult.secure_url;
    }

    const proofImage = uploadedUrl || proofImageUrl;
    if (!proofImage) throw new AppError("Provide proofImage file or proofImageUrl", 400);

    const { data: updatedWinner, error } = await supabase
      .from("winners")
      .update({ proof_image: proofImage, status: "pending" })
      .eq("id", winner.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.status(200).json({ winner: updatedWinner });
  } catch (error) {
    next(error);
  }
}

async function reviewWinner(req, res, next) {
  try {
    const { status } = reviewSchema.parse(req.body);
    const { data: winner } = await supabase
      .from("winners")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (!winner) throw new AppError("Winner not found", 404);

    const { data: updatedWinner, error } = await supabase
      .from("winners")
      .update({ status })
      .eq("id", winner.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    if (winner.status !== status) {
      const [{ data: user }, { data: draw }] = await Promise.all([
        supabase.from("users").select("name, email").eq("id", winner.user_id).maybeSingle(),
        supabase.from("draws").select("month").eq("id", winner.draw_id).maybeSingle()
      ]);

      if (user?.email) {
        if (status === "paid") {
          sendEmail({
            to: user.email,
            subject: "Payout Completed",
            html: winnerPaidEmail(user.name || "Golfer", updatedWinner.prize_amount, draw?.month || "this month")
          }).catch(() => undefined);
        }
        if (status === "rejected") {
          sendEmail({
            to: user.email,
            subject: "Winner Verification Update",
            html: winnerRejectedEmail(user.name || "Golfer", draw?.month || "this month")
          }).catch(() => undefined);
        }
      }
    }

    res.status(200).json({ winner: updatedWinner });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listWinners,
  uploadProof,
  reviewWinner
};
