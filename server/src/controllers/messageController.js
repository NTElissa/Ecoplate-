import Message from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listMessages = asyncHandler(async (_req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }));
});

export const updateMessage = asyncHandler(async (req, res) => {
  const doc = await Message.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  if (req.body.read !== undefined) doc.read = !!req.body.read;
  if (req.body.replied !== undefined) doc.replied = !!req.body.replied;
  await doc.save();
  res.json(doc);
});

export const removeMessage = asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
