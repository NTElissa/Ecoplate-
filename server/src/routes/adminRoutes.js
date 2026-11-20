import { Router } from 'express';
import Project from '../models/Project.js';
import Partner from '../models/Partner.js';
import Announcement from '../models/Announcement.js';
import Gallery from '../models/Gallery.js';
import Goal from '../models/Goal.js';
import { protect, requirePermission as can, superAdminOnly } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';
import { crudFactory } from '../utils/crudFactory.js';
import { overview, upload } from '../controllers/statsController.js';
import { readSettings, updateSettings } from '../controllers/settingController.js';
import { listDonations, updateDonation, removeDonation, exportDonations, donationMeta, replyDonation } from '../controllers/donationController.js';
import { listMessages, updateMessage, removeMessage } from '../controllers/messageController.js';
import { listSubscribers, removeSubscriber, exportSubscribers } from '../controllers/subscriberController.js';
import { listAdmins, createAdmin, updateAdmin, removeAdmin } from '../controllers/userController.js';
import { PERMISSIONS } from '../config/permissions.js';

const router = Router();
router.use(protect);

router.get('/overview', overview);
router.get('/permissions', (_req, res) => res.json(PERMISSIONS));
router.post('/upload', uploadImage, upload);

// Simple CRUD resources
function resource(path, permission, Model, opts) {
  const c = crudFactory(Model, opts);
  router.get(`/${path}`, can(permission), c.list);
  router.post(`/${path}`, can(permission), c.create);
  router.put(`/${path}/:id`, can(permission), c.update);
  router.delete(`/${path}/:id`, can(permission), c.remove);
}

resource('projects', 'projects', Project, {
  fields: ['title', 'summary', 'description', 'status', 'image', 'order', 'published'],
  images: ['image'],
});
resource('partners', 'partners', Partner, {
  fields: ['name', 'type', 'description', 'website', 'logo', 'order', 'published'],
  images: ['logo'],
});
resource('announcements', 'announcements', Announcement, {
  fields: ['title', 'body', 'category', 'image', 'pinned', 'published', 'publishedAt'],
  images: ['image'],
  sort: { pinned: -1, publishedAt: -1 },
});
resource('gallery', 'gallery', Gallery, {
  fields: ['title', 'caption', 'category', 'image', 'order', 'published'],
  images: ['image'],
});
resource('goals', 'goals', Goal, {
  fields: ['kind', 'title', 'description', 'phase', 'order', 'published'],
});

// Site content
router.get('/settings', can('content'), readSettings);
router.put('/settings', can('content'), updateSettings);

// Donations
router.get('/donations/export', can('donations'), exportDonations);
router.get('/donations/meta', can('donations'), donationMeta);
router.get('/donations', can('donations'), listDonations);
router.post('/donations/:id/reply', can('donations'), replyDonation);
router.put('/donations/:id', can('donations'), updateDonation);
router.delete('/donations/:id', can('donations'), removeDonation);

// Messages
router.get('/messages', can('messages'), listMessages);
router.put('/messages/:id', can('messages'), updateMessage);
router.delete('/messages/:id', can('messages'), removeMessage);

// Subscribers
router.get('/subscribers/export', can('subscribers'), exportSubscribers);
router.get('/subscribers', can('subscribers'), listSubscribers);
router.delete('/subscribers/:id', can('subscribers'), removeSubscriber);

// Admin management: super admin only
router.get('/users', superAdminOnly, listAdmins);
router.post('/users', superAdminOnly, createAdmin);
router.put('/users/:id', superAdminOnly, updateAdmin);
router.delete('/users/:id', superAdminOnly, removeAdmin);

export default router;
