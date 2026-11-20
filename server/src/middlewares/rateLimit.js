import rateLimit from 'express-rate-limit';

const make = (windowMs, max, message) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { message } });

export const loginLimiter = make(15 * 60 * 1000, 10, 'Too many sign-in attempts. Try again in 15 minutes.');
export const publicFormLimiter = make(10 * 60 * 1000, 15, 'You are sending too fast. Please try again in a few minutes.');
export const apiLimiter = make(60 * 1000, 300, 'Too many requests.');
