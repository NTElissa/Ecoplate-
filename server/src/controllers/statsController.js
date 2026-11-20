import Project from '../models/Project.js';
import Partner from '../models/Partner.js';
import Announcement from '../models/Announcement.js';
import Gallery from '../models/Gallery.js';
import Goal from '../models/Goal.js';
import Donation from '../models/Donation.js';
import Message from '../models/Message.js';
import Subscriber from '../models/Subscriber.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Only returns numbers for the areas this person is allowed to see.
export const overview = asyncHandler(async (req, res) => {
  const u = req.user;
  const out = { counts: {} };
  const jobs = [];
  const add = (perm, fn) => u.can(perm) && jobs.push(fn());

  add('projects', async () => (out.counts.projects = await Project.countDocuments()));
  add('partners', async () => (out.counts.partners = await Partner.countDocuments()));
  add('announcements', async () => (out.counts.announcements = await Announcement.countDocuments()));
  add('gallery', async () => (out.counts.gallery = await Gallery.countDocuments()));
  add('goals', async () => (out.counts.goals = await Goal.countDocuments()));
  add('subscribers', async () => (out.counts.subscribers = await Subscriber.countDocuments()));

  add('messages', async () => {
    out.counts.messages = await Message.countDocuments();
    out.counts.unreadMessages = await Message.countDocuments({ read: false });
    out.recentMessages = await Message.find().sort({ createdAt: -1 }).limit(5);
  });

  add('donations', async () => {
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const [totals, monthly, pending, recent, needsThanks] = await Promise.all([
      Donation.aggregate([{ $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Donation.aggregate([
        { $match: { status: 'confirmed', createdAt: { $gte: since } } },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Donation.countDocuments({ status: 'pending' }),
      Donation.find().sort({ createdAt: -1 }).limit(5),
      Donation.countDocuments({ status: 'confirmed', lastRepliedAt: { $exists: false } }),
    ]);

    const t = Object.fromEntries(totals.map((x) => [x._id, x]));
    out.donations = {
      confirmedTotal: t.confirmed?.total || 0,
      confirmedCount: t.confirmed?.count || 0,
      pendingTotal: t.pending?.total || 0,
      pendingCount: pending,
      needsThanks,
    };
    const series = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const hit = monthly.find((x) => x._id.y === d.getFullYear() && x._id.m === d.getMonth() + 1);
      series.push({ label: d.toLocaleString('en', { month: 'short' }), total: hit?.total || 0, count: hit?.count || 0 });
    }
    out.donationSeries = series;
    out.recentDonations = recent;
  });

  if (u.role === 'superadmin') jobs.push(User.countDocuments().then((n) => (out.counts.admins = n)));

  await Promise.all(jobs);
  res.json(out);
});

export const upload = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image received.' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
};
