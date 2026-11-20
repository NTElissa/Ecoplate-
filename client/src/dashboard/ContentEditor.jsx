import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { PageHeader, Field, ImageField, Loading, Seg } from './ui.jsx';

const TABS = ['Hero', 'About', 'Mission and vision', 'The problem', 'Contact', 'Donations', 'Social links', 'Footer'];

export default function ContentEditor() {
  const [s, setS] = useState(null);
  const [tab, setTab] = useState(TABS[0]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { api.get('settings').then(setS).catch((e) => toast.error(e.message)); }, []); // eslint-disable-line

  if (!s) return <Loading />;

  const set = (sec, key, val) => setS((x) => ({ ...x, [sec]: { ...x[sec], [key]: val } }));
  const text = (sec, key, label, props = {}) => (
    <Field label={label} help={props.help} className={props.className}>
      {props.area ? (
        <textarea className="input" rows={props.rows || 3} value={s[sec][key] ?? ''} onChange={(e) => set(sec, key, e.target.value)} />
      ) : (
        <input className="input" type={props.type || 'text'} value={s[sec][key] ?? ''} onChange={(e) => set(sec, key, e.target.value)} />
      )}
    </Field>
  );

  async function save() {
    setSaving(true);
    try {
      const { _id, __v, createdAt, updatedAt, ...body } = s;
      setS(await api.put('settings', body));
      try { localStorage.removeItem('ecoplate_home_v1'); } catch { /* ignore */ }
      toast.ok('Website content saved');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Page content" subtitle="Edit the words and photos on the home page.">
        <button className="btn btn-primary" onClick={save} disabled={saving}><Save size={18} /> {saving ? 'Saving…' : 'Save changes'}</button>
      </PageHeader>

      <div className="mb-5"><Seg value={tab} onChange={setTab} label="Page sections" options={TABS.map((t) => [t, t])} /></div>

      <div className="panel space-y-5 p-5 sm:p-7">
        {tab === 'Hero' && (<>
          {text('hero', 'title', 'Main headline')}
          {text('hero', 'subtitle', 'Short introduction', { area: true })}
          <div className="grid gap-4 sm:grid-cols-2">{text('hero', 'primaryCta', 'Main button text')}{text('hero', 'secondaryCta', 'Second button text')}</div>
          <ImageField label="Big photo" value={s.hero.image} onChange={(u) => set('hero', 'image', u)} help="A landscape photo works best." />
          <div className="grid gap-4 sm:grid-cols-2">{text('brand', 'name', 'Business name')}{text('brand', 'location', 'Location')}</div>
          {text('brand', 'tagline', 'Tagline')}
        </>)}

        {tab === 'About' && (<>
          {text('about', 'title', 'Heading')}
          {text('about', 'body', 'Story', { area: true, rows: 9, help: 'Leave a blank line between paragraphs.' })}
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageField label="Main photo" value={s.about.image} onChange={(u) => set('about', 'image', u)} />
            <ImageField label="Small photo" value={s.about.secondImage} onChange={(u) => set('about', 'secondImage', u)} />
          </div>
        </>)}

        {tab === 'Mission and vision' && (<>
          <Field label="Our mission"><textarea className="input" rows={3} value={s.mission} onChange={(e) => setS({ ...s, mission: e.target.value })} /></Field>
          <Field label="Our vision"><textarea className="input" rows={3} value={s.vision} onChange={(e) => setS({ ...s, vision: e.target.value })} /></Field>
        </>)}

        {tab === 'The problem' && (<>
          {text('problem', 'title', 'Heading')}
          {text('problem', 'farmers', 'The farmers\u2019 side', { area: true })}
          {text('problem', 'hotels', 'The hotels\u2019 side', { area: true })}
          {text('problem', 'solution', 'Our answer (under "Our answer is a loop")', { area: true })}
        </>)}

        {tab === 'Contact' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {text('contact', 'phone', 'Phone')}
            {text('contact', 'whatsapp', 'WhatsApp number', { help: 'Digits only with country code, e.g. 250784358995' })}
            {text('contact', 'email', 'Email', { type: 'email' })}
            {text('contact', 'website', 'Website', { type: 'url' })}
            {text('contact', 'address', 'Address', { className: 'sm:col-span-2' })}
            {text('contact', 'hours', 'Opening hours', { className: 'sm:col-span-2' })}
          </div>
        )}

        {tab === 'Donations' && (<>
          {text('donation', 'title', 'Heading')}
          {text('donation', 'intro', 'Introduction', { area: true })}
          <div className="grid gap-4 sm:grid-cols-2">
            {text('donation', 'momoNumber', 'Mobile money number shown to donors')}
            {text('donation', 'momoName', 'Name on the mobile money account')}
          </div>
          {text('donation', 'instructions', 'Instructions shown after a donor submits', { area: true })}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fundraising goal (RWF)" help="Shows a progress bar on the website. Use 0 to hide the goal.">
              <input className="input" type="number" min="0" value={s.donation.target} onChange={(e) => set('donation', 'target', Number(e.target.value))} />
            </Field>
            <Field label="Suggested amounts" help="Separate with commas.">
              <input className="input" value={s.donation.suggested.join(', ')} onChange={(e) => set('donation', 'suggested', e.target.value.split(',').map((x) => Number(x.trim())).filter((n) => n > 0))} />
            </Field>
          </div>
          <Field label="Where the money goes" help="One item per line.">
            <textarea className="input" rows={5} value={s.donation.uses.join('\n')} onChange={(e) => set('donation', 'uses', e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))} />
          </Field>
        </>)}

        {tab === 'Social links' && (<>
          <p className="text-ink/65">Only links you fill in will appear in the footer. Use the full address starting with https://</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((k) => text('social', k, k[0].toUpperCase() + k.slice(1), { type: 'url' }))}
          </div>
        </>)}

        {tab === 'Footer' && text('footer', 'note', 'Footer message')}
      </div>

      <div className="mt-5 flex justify-end"><button className="btn btn-primary" onClick={save} disabled={saving}><Save size={18} /> {saving ? 'Saving…' : 'Save changes'}</button></div>
    </>
  );
}
