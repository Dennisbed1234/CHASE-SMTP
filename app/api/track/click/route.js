const { recordClick } = require('../../../../lib/store');

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const id = (url.searchParams.get('id') || '').trim();
  const u = url.searchParams.get('u') || '';

  let target = 'https://www.google.com';
  try {
    const parsed = new URL(u);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      target = parsed.toString();
    }
  } catch {
    /* keep default */
  }

  if (id) {
    try {
      await recordClick(id);
    } catch {
      /* ignore */
    }
  }

  return Response.redirect(target, 302);
}
