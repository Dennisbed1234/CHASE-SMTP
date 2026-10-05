const { recordOpen } = require('../../../../lib/store');

export const dynamic = 'force-dynamic';

const GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (id) {
    try {
      await recordOpen(id);
    } catch {
      /* ignore */
    }
  }
  return new Response(GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
