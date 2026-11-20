import { env } from '../config/env.js';

export const notFound = (req, res) => res.status(404).json({ message: 'Not found' });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid value or id.';
  } else if (err.code === 11000) {
    status = 409;
    message = 'That value already exists.';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'Image is too large (max 6 MB).';
  } else if (err.name === 'MulterError') {
    status = 400;
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 && env.isProd ? 'Something went wrong' : message });
};
