import Project from '../models/Project.js';
import Partner from '../models/Partner.js';
import Announcement from '../models/Announcement.js';
import Gallery from '../models/Gallery.js';
import Goal from '../models/Goal.js';
import Donation from '../models/Donation.js';
import Message from '../models/Message.js';
import Subscriber from '../models/Subscriber.js';
import { getSettings } from './settingController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || ''));
const byOrder = { order: 1, createdAt: -1 };

export const home = asyncHandler(async (_req, res) => {
  const [settings, projects, partners, announcements, gallery, goals, raised, donors] = await Promise.all([
    getSettings(),
    Project.find({ published: true }).sort(byOrder),
    Partner.find({ published: true }).sort(byOrder),
    Announcement.find({ published: true }).sort({ pinned: -1, publishedAt: -1 }).limit(9),
    Gallery.find({ published: true }).sort(byOrder),
    Goal.find({ published: true }).sort(byOrder),
    Donation.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Donation.find({ status: 'confirmed', anonymous: false }).sort({ confirmedAt: -1 }).limit(8).select('donorName'),
  ]);

  res.json({
    settings, projects, partners, announcements, gallery, goals,
    donations: {
      raised: raised[0]?.total || 0,
      count: raised[0]?.count || 0,
      donors: donors.map((d) => d.donorName),
    },
  });
});

export const createDonation = asyncHandler(async (req, res) => {
  const { donorName, email, phone, amount, method, message, anonymous } = req.body;
  const value = Number(amount);
  if (!String(donorName || '').trim()) return res.status(400).json({ message: 'Please tell us your name.' });
  if (!Number.isFinite(value) || value < 500) return res.status(400).json({ message: 'The smallest gift we can accept is 500 RWF.' });
  if (email && !isEmail(email)) return res.status(400).json({ message: 'That email address does not look right.' });
  if (!email && !phone) return res.status(400).json({ message: 'Leave an email or phone number so we can confirm your gift.' });

  const settings = await getSettings();
  const donation = await Donation.create({
    donorName, email, phone, amount: Math.round(value), method: ['momo', 'bank', 'cash', 'other'].includes(method) ? method : 'momo',
    message, anonymous: !!anonymous, currency: settings.donation.currency,
  });
  res.status(201).json({ reference: donation.reference, amount: donation.amount, currency: donation.currency });
});

export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, body, interest, website } = req.body;
  if (website) return res.status(201).json({ message: 'Thank you.' }); // honeypot for bots
  if (!String(name || '').trim() || !String(body || '').trim()) return res.status(400).json({ message: 'Name and message are required.' });
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  await Message.create({ name, email, phone, subject, body, interest });
  res.status(201).json({ message: 'Thank you. We will write back soon.' });
});

export const subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  res.status(201).json({ message: 'You are on the list. Thank you.' });
});
