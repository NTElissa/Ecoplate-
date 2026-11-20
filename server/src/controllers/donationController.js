import Donation from '../models/Donation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toCSV } from '../utils/csv.js';
import { getSettings } from './settingController.js';
import { mailerEnabled, sendMail } from '../utils/mailer.js';

export const listDonations = asyncHandler(async (_req, res) => {
  res.json(await Donation.find().sort({ createdAt: -1 }));
});

export const updateDonation = asyncHandler(async (req, res) => {
  const doc = await Donation.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  const { status, note } = req.body;
  if (status && ['pending', 'confirmed', 'rejected'].includes(status) && status !== doc.status) {
    doc.status = status;
    doc.confirmedAt = status === 'confirmed' ? new Date() : undefined;
    doc.confirmedBy = status === 'confirmed' ? req.user._id : undefined;
  }
  if (note !== undefined) doc.note = note;
  await doc.save();
  res.json(doc);
});

// Details the reply screen needs to write a good message.
export const donationMeta = asyncHandler(async (_req, res) => {
  const s = await getSettings();
  res.json({
    emailEnabled: mailerEnabled(),
    orgName: s.brand.name,
    momoNumber: s.donation.momoNumber,
    momoName: s.donation.momoName,
    currency: s.donation.currency,
    replyTo: s.contact.email,
  });
});

const CHANNELS = ['email', 'email-app', 'whatsapp', 'sms', 'note'];

// Only the "email" channel is actually sent by the server. The others record that staff
// answered from their own email app, WhatsApp or phone, or left a private note.
export const replyDonation = asyncHandler(async (req, res) => {
  const doc = await Donation.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });

  const channel = CHANNELS.includes(req.body.channel) ? req.body.channel : 'note';
  const subject = String(req.body.subject || '').trim().slice(0, 160);
  const message = String(req.body.message || '').trim();
  if (!message) return res.status(400).json({ message: 'Write a message first.' });
  if (message.length > 4000) return res.status(400).json({ message: 'That message is too long.' });

  if (channel === 'email') {
    if (!doc.email) return res.status(400).json({ message: 'This donor did not leave an email address.' });
    if (!mailerEnabled()) {
      return res.status(400).json({ message: 'Email sending is not set up on the server yet. Use "Open in my email app" instead.' });
    }
    try {
      const s = await getSettings();
      await sendMail({ to: doc.email, subject: subject || `Thank you from ${s.brand.name}`, text: message, replyTo: s.contact.email || undefined });
    } catch (err) {
      console.error('Donation reply email failed:', err.message);
      return res.status(502).json({ message: 'The email could not be sent. Check the SMTP settings in server/.env.' });
    }
  }

  doc.replies.push({ channel, subject, message, by: req.user._id, byName: req.user.name, at: new Date() });
  doc.lastRepliedAt = new Date();
  await doc.save();
  res.json(doc);
});

export const removeDonation = asyncHandler(async (req, res) => {
  await Donation.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export const exportDonations = asyncHandler(async (_req, res) => {
  const rows = await Donation.find().sort({ createdAt: -1 });
  const csv = toCSV(rows, [
    { label: 'Reference', value: 'reference' },
    { label: 'Date', value: 'createdAt' },
    { label: 'Name', value: 'donorName' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'Amount', value: 'amount' },
    { label: 'Currency', value: 'currency' },
    { label: 'Method', value: 'method' },
    { label: 'Status', value: 'status' },
    { label: 'Anonymous', value: (r) => (r.anonymous ? 'yes' : 'no') },
    { label: 'Message', value: 'message' },
  ]);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ecoplate-donations.csv"');
  res.send('\uFEFF' + csv);
});
