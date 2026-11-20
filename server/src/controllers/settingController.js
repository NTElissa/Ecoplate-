import Setting from '../models/Setting.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { removeUpload } from '../utils/files.js';

export async function getSettings() {
  let doc = await Setting.findOne();
  if (!doc) doc = await Setting.create({});
  return doc;
}

export const readSettings = asyncHandler(async (_req, res) => res.json(await getSettings()));

const SECTIONS = ['brand', 'hero', 'about', 'problem', 'contact', 'donation', 'social', 'footer'];
const PLAIN = ['mission', 'vision'];
const IMAGE_PATHS = [['hero', 'image'], ['about', 'image'], ['about', 'secondImage']];

export const updateSettings = asyncHandler(async (req, res) => {
  const doc = await getSettings();
  const current = doc.toObject();

  for (const s of SECTIONS) {
    if (req.body[s] && typeof req.body[s] === 'object') {
      for (const [sec, key] of IMAGE_PATHS) {
        if (sec === s && req.body[s][key] !== undefined && req.body[s][key] !== current[s]?.[key]) {
          removeUpload(current[s]?.[key]);
        }
      }
      doc.set(s, { ...current[s], ...req.body[s] });
    }
  }
  for (const p of PLAIN) if (typeof req.body[p] === 'string') doc.set(p, req.body[p]);

  await doc.save();
  res.json(doc);
});
