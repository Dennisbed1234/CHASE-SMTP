const { getStats } = require('../../../lib/store');
const { hasDatabase } = require('../../../lib/db');
const { isMailConfigured } = require('../../../lib/mailer');

export async function GET() {
  const stats = await getStats();
  return Response.json({
    ...stats,
    database: hasDatabase(),
    mailConfigured: isMailConfigured(),
  });
}
