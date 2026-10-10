const { listEmails, getStats } = require('../../../lib/store');
const { hasDatabase } = require('../../../lib/db');

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!hasDatabase()) {
    return Response.json({ emails: [], count: 0, stats: null });
  }
  const sp = new URL(request.url).searchParams;
  const emails = await listEmails({
    q: sp.get('q') || undefined,
    status: sp.get('status') || undefined,
    limit: Number(sp.get('limit') || 500),
  });
  const stats = await getStats();
  return Response.json({ emails, count: emails.length, stats });
}
