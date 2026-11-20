import Subscriber from '../models/Subscriber.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toCSV } from '../utils/csv.js';

export const listSubscribers = asyncHandler(async (_req, res) => {
  res.json(await Subscriber.find().sort({ createdAt: -1 }));
});

export const removeSubscriber = asyncHandler(async (req, res) => {
  await Subscriber.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export const exportSubscribers = asyncHandler(async (_req, res) => {
  const rows = await Subscriber.find().sort({ createdAt: -1 });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ecoplate-subscribers.csv"');
  res.send(toCSV(rows, [{ label: 'Email', value: 'email' }, { label: 'Joined', value: 'createdAt' }]));
});
