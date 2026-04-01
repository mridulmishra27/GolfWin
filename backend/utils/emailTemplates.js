const baseTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #020617; color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-decoration: none; }
    .logo span { color: #3b82f6; }
    .card { background-color: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 40px; }
    .title { font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 24px; color: #f8fafc; }
    .text { font-size: 15px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 15px; text-align: center; margin-top: 10px; }
    .footer { text-align: center; margin-top: 40px; font-size: 13px; color: #64748b; }
    .highlight { color: #f8fafc; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">GOLF<span>PLATFORM</span></div>
    </div>
    <div class="card">
      <h2 class="title">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Golf Platform. All rights reserved.</p>
      <p>You received this communication because you are registered on our platform.</p>
    </div>
  </div>
</body>
</html>
`;

const welcomeEmail = (name) => baseTemplate(`
  <p class="text">Hi <span class="highlight">${name}</span>,</p>
  <p class="text">Welcome to the Golf Platform. Your account has been successfully provisioned and is ready for access.</p>
  <p class="text">Explore our premium tournaments, track your live scores, and see your direct charitable impact all from your command dashboard.</p>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://golf-charity-frontend-eta.vercel.app/login" class="btn">Access Dashboard</a>
  </div>
`, "Account Provisioned Successfully");

const subscriptionActivatedEmail = () => baseTemplate(`
  <p class="text">Your premium subscription has been <span style="color: #10b981; font-weight: 600;">Authorized and Activated</span>.</p>
  <p class="text">You have successfully unlocked unlimited draws, full algorithmic analytics, and priority placement in the upcoming prize pool.</p>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://golf-charity-frontend-eta.vercel.app/dashboard" class="btn">View Active Status</a>
  </div>
`, "Subscription Activated");

const subscriptionRenewedEmail = (plan) => baseTemplate(`
  <p class="text">Your <span class="highlight" style="text-transform: capitalize;">${plan}</span> subscription cycle has been successfully renewed.</p>
  <p class="text">Thank you for your continued strategic support. A portion of your tactical renewal has automatically been routed to your chosen global charity initiative.</p>
`, "Subscription Renewed");

const winnerAlertEmail = (name, month) => baseTemplate(`
  <p class="text">Hi <span class="highlight">${name}</span>!</p>
  <p class="text">Congratulations. Our proprietary engine has completed the <span class="highlight">${month}</span> tactical draw, and your unique sequences <strong>matched the winning outputs!</strong></p>
  <p class="text">Your tier classification and prize disbursements are now pending verification in your control suite.</p>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://golf-charity-frontend-eta.vercel.app/dashboard" class="btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">Claim Winnings</a>
  </div>
`, "WINNER IDENTIFIED: Action Required");

const drawResultsEmail = (name, month) => baseTemplate(`
  <p class="text">Hi <span class="highlight">${name}</span>,</p>
  <p class="text">The engine sequence for <span class="highlight">${month}</span> has successfully concluded.</p>
  <p class="text">The winning numbers have been compiled and published globally. Log in to your command center to verify your algorithmic alignment and track the updated charity impact metrics.</p>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://golf-charity-frontend-eta.vercel.app/dashboard" class="btn">View Draw Network</a>
  </div>
`, "Official Draw Results Published");

const winnerPaidEmail = (name, amount, month) => baseTemplate(`
  <p class="text">Hi <span class="highlight">${name}</span>,</p>
  <p class="text">Good news — your <span class="highlight">${month}</span> winnings have been <span style="color: #10b981; font-weight: 600;">approved and marked as paid</span>.</p>
  <p class="text">Amount: <span class="highlight">₹${Number(amount || 0).toFixed(2)}</span></p>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://golf-charity-frontend-eta.vercel.app/dashboard/winnings" class="btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">View payout status</a>
  </div>
`, "Payout Completed");

const winnerRejectedEmail = (name, month) => baseTemplate(`
  <p class="text">Hi <span class="highlight">${name}</span>,</p>
  <p class="text">Your <span class="highlight">${month}</span> winner verification was <span style="color: #ef4444; font-weight: 600;">rejected</span>.</p>
  <p class="text">If you believe this is an error, please upload a clearer proof screenshot from the golf platform and contact support.</p>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://golf-charity-frontend-eta.vercel.app/dashboard/winnings" class="btn">Open winnings</a>
  </div>
`, "Winner Verification Update");

module.exports = {
  welcomeEmail,
  subscriptionActivatedEmail,
  subscriptionRenewedEmail,
  winnerAlertEmail,
  drawResultsEmail,
  winnerPaidEmail,
  winnerRejectedEmail
};
