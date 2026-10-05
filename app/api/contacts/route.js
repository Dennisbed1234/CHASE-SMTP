const { listContacts } = require('../../../lib/store');
const { hasDatabase } = require('../../../lib/db');

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!hasDatabase()) {
    return Response.json({
      success: false,
      error: 'DATABASE_URL not set',
      contacts: [],
      totalUnique: 0,
      totalSentLogs: 0,
    });
  }
  const sp = new URL(request.url).searchParams;
  const data = await listContacts({
    q: sp.get('q') || undefined,
    limit: Number(sp.get('limit') || 5000),
  });
  return Response.json({ success: true, ...data });
}
