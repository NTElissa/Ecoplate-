import { asyncHandler } from './asyncHandler.js';
import { removeUpload } from './files.js';

// Builds list/create/update/remove handlers for a model.
// `fields`  : body keys that may be written
// `images`  : fields that hold uploaded image urls (old files are deleted when replaced)
// `sort`    : default sort
export function crudFactory(Model, { fields, images = [], sort = { order: 1, createdAt: -1 } }) {
  const pick = (body) => {
    const out = {};
    for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
    return out;
  };

  return {
    list: asyncHandler(async (_req, res) => {
      res.json(await Model.find().sort(sort));
    }),

    create: asyncHandler(async (req, res) => {
      res.status(201).json(await Model.create(pick(req.body)));
    }),

    update: asyncHandler(async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      const data = pick(req.body);
      for (const f of images) {
        if (data[f] !== undefined && data[f] !== doc[f]) removeUpload(doc[f]);
      }
      doc.set(data);
      await doc.save();
      res.json(doc);
    }),

    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      images.forEach((f) => removeUpload(doc[f]));
      res.json({ message: 'Deleted' });
    }),
  };
}
