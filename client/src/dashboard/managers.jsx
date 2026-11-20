import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import ResourceManager from './ResourceManager.jsx';
import { api } from '../lib/api.js';
import { date } from '../lib/format.js';

const published = { name: 'published', type: 'checkbox', label: 'Show on the website' };
const order = { name: 'order', type: 'number', label: 'Position', help: 'Smaller numbers appear first.' };

export function Projects() {
  return (
    <ResourceManager
      title="Projects" subtitle="The work shown in the Projects section." endpoint="projects" noun="Project"
      defaults={{ status: 'ongoing', published: true, order: 0, title: '', summary: '', description: '', image: '' }}
      fields={[
        { name: 'title', label: 'Title', required: true, max: 140 },
        { name: 'status', label: 'Status', type: 'select', options: [['ongoing', 'Ongoing'], ['completed', 'Completed'], ['planned', 'Coming up']] },
        { name: 'summary', label: 'Short summary', type: 'textarea', rows: 2, max: 400, help: 'Shown on the card.' },
        { name: 'description', label: 'Full description', type: 'textarea', rows: 6, help: 'Shown when someone opens the project.' },
        { name: 'image', type: 'image', label: 'Photo' },
        order, published,
      ]}
      card={(p) => ({ image: p.image, title: p.title, sub: p.summary, badges: [[{ ongoing: 'Ongoing', completed: 'Completed', planned: 'Coming up' }[p.status], p.status === 'completed' ? 'dark' : p.status === 'ongoing' ? 'green' : 'gray']] })}
      filters={{ options: [['ongoing', 'Ongoing'], ['completed', 'Completed'], ['planned', 'Coming up']], test: (i, f) => i.status === f }}
    />
  );
}

export function Partners() {
  const types = [['hotel', 'Hotel'], ['farmers', 'Farmers or cooperative'], ['government', 'Government'], ['ngo', 'NGO'], ['business', 'Business'], ['other', 'Other']];
  return (
    <ResourceManager
      title="Partners" subtitle="Hotels, farmer groups, institutions and supporters." endpoint="partners" noun="Partner"
      defaults={{ type: 'hotel', published: true, order: 0, name: '', description: '', website: '', logo: '' }}
      fields={[
        { name: 'name', label: 'Name', required: true, max: 140 },
        { name: 'type', label: 'Type', type: 'select', options: types },
        { name: 'description', label: 'What they do with us', type: 'textarea', rows: 3, max: 500 },
        { name: 'website', label: 'Website (optional)', type: 'url', help: 'Start with https://' },
        { name: 'logo', type: 'image', label: 'Logo (optional)' },
        order, published,
      ]}
      card={(p) => ({ image: p.logo || '', title: p.name, sub: p.description, badges: [[types.find((t) => t[0] === p.type)?.[1], 'green']] })}
    />
  );
}

export function Announcements() {
  const cats = [['news', 'News'], ['funding', 'Funding'], ['production', 'Production'], ['event', 'Event'], ['notice', 'Notice']];
  return (
    <ResourceManager
      title="Announcements" subtitle="News and updates shown in the Announcements section." endpoint="announcements" noun="Announcement"
      defaults={{ category: 'news', published: true, pinned: false, title: '', body: '', image: '', publishedAt: new Date().toISOString() }}
      fields={[
        { name: 'title', label: 'Title', required: true, max: 160 },
        { name: 'category', label: 'Category', type: 'select', options: cats },
        { name: 'body', label: 'Text', type: 'textarea', rows: 6, required: true },
        { name: 'image', type: 'image', label: 'Photo (optional)' },
        { name: 'publishedAt', label: 'Date', type: 'date' },
        { name: 'pinned', type: 'checkbox', label: 'Pin to the top as the main story' },
        published,
      ]}
      card={(a) => ({ image: a.image || '', title: a.title, sub: a.body, badges: [[cats.find((c) => c[0] === a.category)?.[1], 'green'], [date(a.publishedAt), 'gray'], ...(a.pinned ? [['Pinned', 'amber']] : [])] })}
    />
  );
}

export function Goals() {
  const kinds = [['objective', 'Goal'], ['milestone', 'Timeline phase'], ['step', 'Production step']];
  return (
    <ResourceManager
      title="Goals and steps" subtitle="Goals, the twelve month timeline, and the production steps." endpoint="goals" noun="Item"
      defaults={{ kind: 'objective', published: true, order: 0, title: '', description: '', phase: '' }}
      fields={[
        { name: 'kind', label: 'Where it appears', type: 'select', options: kinds, help: 'Goal: the list of goals. Timeline phase: the twelve month plan. Production step: "How it works".' },
        { name: 'title', label: 'Title', required: true, max: 140 },
        { name: 'phase', label: 'Time frame (timeline phases only)', max: 60, help: 'For example: 0 to 2 months' },
        { name: 'description', label: 'Description', type: 'textarea', rows: 3, max: 600 },
        order, published,
      ]}
      card={(g) => ({ title: g.title, sub: g.description, badges: [[kinds.find((k) => k[0] === g.kind)?.[1], g.kind === 'objective' ? 'green' : g.kind === 'step' ? 'blue' : 'amber'], ...(g.phase ? [[g.phase, 'gray']] : [])] })}
      filters={{ options: kinds, test: (i, f) => i.kind === f }}
    />
  );
}

const GALLERY_CATS = [['waste', 'Hotel waste'], ['process', 'Our process'], ['product', 'The product'], ['farmers', 'With farmers'], ['team', 'The team']];

function BulkUpload({ reload, toast }) {
  const ref = useRef();
  const [cat, setCat] = useState('process');
  const [busy, setBusy] = useState(false);

  async function onFiles(e) {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    let ok = 0;
    for (const f of files) {
      try {
        const { url } = await api.upload(f);
        await api.post('gallery', { image: url, category: cat, title: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 80), published: true });
        ok++;
      } catch (err) { toast.error(`${f.name}: ${err.message}`); }
    }
    setBusy(false);
    if (ok) { toast.ok(`${ok} photo${ok > 1 ? 's' : ''} added`); reload(); }
  }

  return (
    <div className="flex items-center gap-2">
      <select className="input !w-auto !py-2.5" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category for uploaded photos">{GALLERY_CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <button className="btn btn-lime !py-2.5" onClick={() => ref.current.click()} disabled={busy}>{busy ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Upload photos</button>
      <input ref={ref} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFiles} />
    </div>
  );
}

export function GalleryManager() {
  return (
    <ResourceManager
      title="Gallery" subtitle="Upload many photos at once, then add captions by editing them." endpoint="gallery" noun="Photo"
      header={(p) => <BulkUpload {...p} />}
      defaults={{ category: 'process', published: true, order: 0, title: '', caption: '', image: '' }}
      fields={[
        { name: 'image', type: 'image', label: 'Photo' },
        { name: 'title', label: 'Title', max: 140 },
        { name: 'caption', label: 'Caption', type: 'textarea', rows: 2, max: 300 },
        { name: 'category', label: 'Category', type: 'select', options: GALLERY_CATS },
        order, published,
      ]}
      card={(g) => ({ image: g.image, title: g.title || 'Untitled photo', sub: g.caption, badges: [[GALLERY_CATS.find((c) => c[0] === g.category)?.[1], 'green']] })}
      filters={{ options: GALLERY_CATS, test: (i, f) => i.category === f }}
    />
  );
}
