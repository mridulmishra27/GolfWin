import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const normalizeCharity = (charity) => {
  if (!charity) return charity;
  return {
    ...charity,
    id: charity.id ?? charity._id,
    _id: charity._id ?? charity.id,
    totalDonations: charity.totalDonations ?? charity.total_donations ?? 0,
    total_donations: charity.total_donations ?? charity.totalDonations ?? 0,
    isSpotlight: charity.isSpotlight ?? charity.is_spotlight ?? false,
    is_spotlight: charity.is_spotlight ?? charity.isSpotlight ?? false,
    spotlight: charity.spotlight ?? charity.isSpotlight ?? charity.is_spotlight ?? false,
    createdAt: charity.createdAt ?? charity.created_at,
    created_at: charity.created_at ?? charity.createdAt,
  };
};

const normalizeUser = (user) => {
  if (!user) return user;
  return {
    ...user,
    id: user.id ?? user._id,
    _id: user._id ?? user.id,
    subscriptionStatus: user.subscriptionStatus ?? user.subscription_status,
    subscription_status: user.subscription_status ?? user.subscriptionStatus,
    charityPercentage: user.charityPercentage ?? user.charity_percentage,
    charity_percentage: user.charity_percentage ?? user.charityPercentage,
    createdAt: user.createdAt ?? user.created_at,
    created_at: user.created_at ?? user.createdAt,
    charity: normalizeCharity(user.charity ?? user.charities),
    charities: normalizeCharity(user.charities ?? user.charity),
  };
};

const normalizeDraw = (draw) => {
  if (!draw) return draw;
  return {
    ...draw,
    id: draw.id ?? draw._id,
    _id: draw._id ?? draw.id,
    numbers: draw.numbers ?? draw.winning_numbers ?? [],
    winning_numbers: draw.winning_numbers ?? draw.numbers ?? [],
    totalPool: draw.totalPool ?? draw.total_pool ?? 0,
    total_pool: draw.total_pool ?? draw.totalPool ?? 0,
    subscriberCount: draw.subscriberCount ?? draw.breakdown?.subscriberCount ?? 0,
    participantCount: draw.participantCount ?? draw.participants_count ?? 0,
    participants_count: draw.participants_count ?? draw.participantCount ?? 0,
    jackpotCarryForward: draw.jackpotCarryForward ?? draw.breakdown?.carryOut ?? 0,
    createdAt: draw.createdAt ?? draw.created_at,
    created_at: draw.created_at ?? draw.createdAt,
  };
};

const normalizeWinner = (winner) => {
  if (!winner) return winner;
  return {
    ...winner,
    id: winner.id ?? winner._id,
    _id: winner._id ?? winner.id,
    user: normalizeUser(winner.user ?? winner.users),
    users: normalizeUser(winner.users ?? winner.user),
    draw: normalizeDraw(winner.draw ?? winner.draws),
    draws: normalizeDraw(winner.draws ?? winner.draw),
    matchType: winner.matchType ?? winner.match_type,
    match_type: winner.match_type ?? winner.matchType,
    prizeAmount: winner.prizeAmount ?? winner.prize_amount ?? 0,
    prize_amount: winner.prize_amount ?? winner.prizeAmount ?? 0,
    proofImage: winner.proofImage ?? winner.proof_image,
    proof_image: winner.proof_image ?? winner.proofImage,
    createdAt: winner.createdAt ?? winner.created_at,
    created_at: winner.created_at ?? winner.createdAt,
  };
};

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
// Backward-compatible wrappers used by auth pages.
const normalizeAuthResponse = (data) => {
  if (!data) return data;
  if (data.session?.access_token) return data;
  if (data.token) {
    return {
      ...data,
      session: {
        access_token: data.token,
      },
    };
  }
  return data;
};

export const loginUserApi = async (email, password) => {
  const res = await login({ email, password });
  return normalizeAuthResponse(res.data);
};
export const registerUserApi = async (name, email, password) => {
  const res = await register({ name, email, password });
  return normalizeAuthResponse(res.data);
};

// User
export const getProfile = () => API.get('/users/profile');
export const getAnalytics = () => API.get('/users/analytics');
export const getAdminUsers = (q) =>
  API.get(`/users/admin/users${q ? `?q=${q}` : ''}`).then((res) => ({
    ...res,
    data: {
      ...res.data,
      users: (res.data?.users || []).map(normalizeUser),
    },
  }));
export const updateAdminUser = (id, data) => API.patch(`/users/admin/users/${id}`, data);

// Scores
export const getScores = () => API.get('/scores');
export const addScore = (data) => API.post('/scores', data);
export const updateAdminScore = (id, data) => API.patch(`/scores/admin/${id}`, data);

// Subscriptions
export const createSubscription = (data) => API.post('/subscriptions', data);
export const createCheckoutSession = (plan) => createSubscription({ plan });
export const getMySubscription = () => API.get('/subscriptions/me');
export const cancelSubscription = () => API.post('/subscriptions/cancel');
export const renewSubscription = (data) => API.post('/subscriptions/renew', data);
export const getAdminSubscriptions = (status) => API.get(`/subscriptions/admin${status ? `?status=${status}` : ''}`);

// Charities
export const getCharities = () =>
  API.get('/charities').then((res) => ({
    ...res,
    data: {
      ...res.data,
      charities: (res.data?.charities || []).map(normalizeCharity),
    },
  }));
export const getCharity = (id) =>
  API.get(`/charities/${id}`).then((res) => ({
    ...res,
    data: {
      ...res.data,
      charity: normalizeCharity(res.data?.charity),
    },
  }));
export const selectCharity = (data) => API.post('/charities/select', data);
export const createCharity = (data) => API.post('/charities', data);
export const updateCharity = (id, data) => API.patch(`/charities/${id}`, data);
export const deleteCharity = (id) => API.delete(`/charities/${id}`);
export const donateToCharity = (id, data) => API.post(`/charities/${id}/donate`, data);
export const createDonationCheckout = (id, data) => API.post(`/charities/${id}/donate/checkout`, data);

// Draw
export const getLatestDraw = () =>
  API.get('/draws/latest').then((res) => ({
    ...res,
    data: {
      ...res.data,
      draw: normalizeDraw(res.data?.draw),
    },
  }));
export const getDrawHistory = () =>
  API.get('/draws/history').then((res) => ({
    ...res,
    data: {
      ...res.data,
      draws: (res.data?.draws || []).map(normalizeDraw),
    },
  }));
export const getCurrentDraw = () =>
  API.get('/draws/current').then((res) => ({
    ...res,
    data: {
      ...res.data,
      draw: normalizeDraw(res.data?.draw),
    },
  }));
export const createDraftDraw = (data) =>
  API.post('/draws/draft', data).then((res) => ({
    ...res,
    data: {
      ...res.data,
      draw: normalizeDraw(res.data?.draw),
    },
  }));
export const simulateDraw = (id) =>
  API.post(`/draws/${id}/simulate`).then((res) => ({
    ...res,
    data: {
      ...res.data,
      draw: normalizeDraw(res.data?.draw),
    },
  }));
export const publishDraw = (id) =>
  API.post(`/draws/${id}/publish`).then((res) => ({
    ...res,
    data: {
      ...res.data,
      draw: normalizeDraw(res.data?.draw),
    },
  }));
export const runDraw = (data) =>
  API.post('/draws/run', data).then((res) => ({
    ...res,
    data: {
      ...res.data,
      draw: normalizeDraw(res.data?.draw),
    },
  }));

// Winners
export const getWinners = () =>
  API.get('/winners').then((res) => ({
    ...res,
    data: {
      ...res.data,
      winners: (res.data?.winners || []).map(normalizeWinner),
    },
  }));
export const uploadWinnerProof = (data) => API.post('/winners/proof', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateWinnerStatus = (id, data) => API.patch(`/winners/${id}/status`, data);

export default API;
