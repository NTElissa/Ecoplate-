// npm run seed          -> adds starter content only where a collection is empty
// npm run seed -- --reset -> wipes content collections first (users and donations are kept)
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { ensureSuperAdmin } from './bootstrap.js';
import { getSettings } from '../controllers/settingController.js';
import Project from '../models/Project.js';
import Partner from '../models/Partner.js';
import Announcement from '../models/Announcement.js';
import Gallery from '../models/Gallery.js';
import Goal from '../models/Goal.js';

const reset = process.argv.includes('--reset');

const projects = [
  {
    title: 'Hotel food waste collection',
    summary: 'Sorted food waste picked up from partner hotels, so nothing useful ends up in a landfill.',
    description:
      'We give partner hotels labelled collection containers and collect the segregated food waste. Our field operators sort out anything that is not organic before it enters the composting process. Hotels save on disposal and cut the methane that rotting waste releases.',
    status: 'ongoing',
    image: '/images/hotel-food-buckets.jpg',
    order: 1,
  },
  {
    title: 'Pilot fertilizer production',
    summary: 'Composting, drying, grinding and packaging: six careful steps from kitchen scraps to a 10 kg bag.',
    description:
      'Our pilot line follows a controlled process: collect, sort, compost, dry and grind, package and label, then store and distribute. Charcoal powder and lime are added to the compost. Quality and safety come before volume.',
    status: 'ongoing',
    image: '/images/bag-closeup.jpg',
    order: 2,
  },
  {
    title: 'Field trials with local farmers',
    summary: 'Maize grown with and without Ecoplate, side by side, in real farmers\u2019 plots.',
    description:
      'Farmers in the area tried Ecoplate on their maize and vegetables and told us what they saw. The difference in the rows is why we keep going. We will keep recording crop results as the pilot grows.',
    status: 'completed',
    image: '/images/with-without.jpg',
    order: 3,
  },
  {
    title: 'Laboratory testing and compliance',
    summary: 'Lab tests and engagement with RAB so every bag is safe and clearly labelled.',
    description:
      'Before we scale, we send fertilizer samples for laboratory testing and engage the Rwanda Agriculture and Animal Resources Development Board (RAB). Every bag carries a clear label and can be traced from the hotel it came from to the farm it went to.',
    status: 'ongoing',
    image: '/images/worker-gloves.jpg',
    order: 4,
  },
  {
    title: 'Farmer guidance and workshops',
    summary: 'Practical training on how and when to apply organic fertilizer.',
    description:
      'Good fertilizer only works when it is used well. We run guidance sessions and workshops for farmers and cooperatives on application, so every bag gives the best result.',
    status: 'planned',
    image: '/images/farmers-group.jpg',
    order: 5,
  },
  {
    title: 'Bulk supply for cooperatives',
    summary: 'Supply agreements that give farmer cooperatives a steady, affordable source of organic fertilizer.',
    description:
      'After the pilot is validated we will scale production and sign bulk supply agreements with cooperatives, vegetable producers and agro-input retailers.',
    status: 'planned',
    image: '/images/maize-rows.jpg',
    order: 6,
  },
];

const partners = [
  {
    name: 'Rwanda Agriculture and Animal Resources Development Board (RAB)',
    type: 'government',
    description: 'We engage RAB on laboratory testing, product standards and regulatory compliance.',
    order: 1,
  },
  {
    name: 'NAEB',
    type: 'government',
    description: 'A government programme we are working towards as part of our target market.',
    order: 2,
  },
];

const announcements = [
  {
    title: 'Ecoplate receives a RWF 4,000,000 prize grant',
    body:
      'We are proud to share that Ecoplate has been awarded a prize grant of RWF 4,000,000. It will pay for regulatory testing, equipment, waste collection logistics, packaging, branding and a controlled pilot. Thank you to everyone who believed in the idea early.',
    category: 'funding',
    image: '/images/poster.jpg',
    pinned: true,
  },
  {
    title: 'Pilot production has started',
    body:
      'Our business is formally registered and pilot production is under way in Karongi. Sorted hotel food waste is being composted, dried, ground and packed into 10 kg bags.',
    category: 'production',
    image: '/images/bag-on-grass.jpg',
  },
  {
    title: 'Looking for hotel and cooperative partners',
    body:
      'Do you run a hotel that wants to turn food waste into something useful, or a cooperative that needs affordable organic fertilizer? Send us a message and let us talk.',
    category: 'notice',
    image: '/images/green-bin.jpg',
  },
];

const gallery = [
  ['Food waste from partner hotels', 'Collected and sorted before it reaches us.', 'waste', 'food-waste-collage'],
  ['Sorted hotel food waste', 'Hotels separate their food waste into containers.', 'waste', 'hotel-food-buckets'],
  ['A bin ready for collection', 'Organic waste, ready to be turned into compost.', 'waste', 'green-bin'],
  ['Mixed waste before sorting', 'Our operators remove everything that is not organic.', 'waste', 'waste-bin'],
  ['Sorting by hand', 'Careful sorting keeps the final product safe.', 'process', 'worker-sorting'],
  ['Protective gear on', 'Gloves, coats and masks for every operator.', 'process', 'worker-gloves'],
  ['Emptying the collection bin', 'Fresh waste goes straight into the process.', 'process', 'worker-collecting'],
  ['Collecting in the yard', 'Field operators at work.', 'team', 'worker-yellow-bin'],
  ['Finished fertilizer', 'Dark, crumbly and ready for the field.', 'product', 'fertilizer-sample'],
  ['10 kg bag of Ecoplate', 'Natural organic fertilizer, made from food waste.', 'product', 'bag-on-grass'],
  ['Bag close-up', 'Clear labelling on every bag.', 'product', 'bag-closeup'],
  ['Ecoplate on the grass', 'Packed and ready for distribution.', 'product', 'bag-on-grass-2'],
  ['Meeting farmers in the field', 'Talking with farmers about what they need.', 'farmers', 'farmers-field'],
  ['Farmers on the hillside', 'Field testing with local growers.', 'farmers', 'farmers-hillside'],
  ['Farmers with Ecoplate', 'Sharing the first bags with the community.', 'farmers', 'farmers-group'],
  ['Maize with and without Ecoplate', 'The same crop, side by side.', 'farmers', 'with-without'],
  ['Healthy maize rows', 'Strong early growth in the field.', 'farmers', 'maize-rows'],
].map(([title, caption, category, file], i) => ({ title, caption, category, image: `/images/${file}.jpg`, order: i + 1 }));

const goals = [
  { kind: 'step', title: 'Collect', description: 'Segregated food waste is picked up from our partner hotels in labelled containers.', order: 1 },
  { kind: 'step', title: 'Sort', description: 'Our field operators remove everything that is not organic, by hand, wearing full protective gear.', order: 2 },
  { kind: 'step', title: 'Compost', description: 'A controlled composting process, with charcoal powder and lime added, turns waste into compost.', order: 3 },
  { kind: 'step', title: 'Dry and grind', description: 'The compost is dried on racks and tarpaulins, then ground into a fine, even material.', order: 4 },
  { kind: 'step', title: 'Package and label', description: 'Fertilizer goes into 10 kg bags with a clear label and contact details for traceability.', order: 5 },
  { kind: 'step', title: 'Store and deliver', description: 'Bags are stored safely and delivered to farmers and cooperatives.', order: 6 },
  { kind: 'objective', title: 'Establish structured pilot operations', description: 'A clear, repeatable routine from hotel collection to packed bag.', order: 1 },
  { kind: 'objective', title: 'Ensure compliance and product safety', description: 'Lab testing, RAB engagement, clear labels and traceability before we scale.', order: 2 },
  { kind: 'objective', title: 'Build partnerships with hotels and farmers', description: 'Both sides of the loop need to trust us and benefit.', order: 3 },
  { kind: 'objective', title: 'Create sustainable employment', description: 'Steady jobs for young people, including young mothers.', order: 4 },
  { kind: 'objective', title: 'Scale after the pilot is validated', description: 'Grow production only when quality and demand are proven.', order: 5 },
  { kind: 'milestone', phase: '0 to 2 months', title: 'Production and lab test', description: 'Collect, produce and package Ecoplate, and submit samples for laboratory testing.', order: 1 },
  { kind: 'milestone', phase: '3 to 5 months', title: 'Pilot distribution', description: 'Put Ecoplate in farmers\u2019 hands and expand hotel and farmer partnerships.', order: 2 },
  { kind: 'milestone', phase: '6 to 12 months', title: 'Scale production', description: 'Grow volume, serve more farmers, and track waste reduced, crop results and revenue.', order: 3 },
];

async function fill(Model, rows, name) {
  if (reset) await Model.deleteMany({});
  if ((await Model.countDocuments()) === 0) {
    await Model.insertMany(rows);
    console.log(`Seeded ${rows.length} ${name}`);
  } else {
    console.log(`Skipped ${name} (already has data)`);
  }
}

await connectDB();
await ensureSuperAdmin();
await getSettings();
await fill(Project, projects, 'projects');
await fill(Partner, partners, 'partners');
await fill(Announcement, announcements, 'announcements');
await fill(Gallery, gallery, 'gallery items');
await fill(Goal, goals, 'goals');
await mongoose.disconnect();
console.log('Done.');
