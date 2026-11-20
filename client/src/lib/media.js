const ORIGIN = import.meta.env.VITE_API_ORIGIN || '';

// Images that ship with the site live in /images. Images added from the dashboard live in /uploads on the API.
export const media = (url) => {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return url.startsWith('/uploads') ? ORIGIN + url : url;
};
