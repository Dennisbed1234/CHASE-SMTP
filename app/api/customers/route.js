const { listCustomers, upsertCustomer, listContacts } = require('../../../lib/store');
const { hasDatabase } = require('../../../lib/db');

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!hasDatabase()) {
    return Response.json({ customers: [], totalUnique: 0 });
  }
  const q = new URL(request.url).searchParams.get('q') || undefined;
  const customers = await listCustomers(q);
  return Response.json({
    customers,
    contacts: customers,
    totalUnique: customers.length,
  });
}

export async function POST(request) {
  if (!hasDatabase()) {
    return Response.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }
  const body = await request.json().catch(() => ({}));
  if (body.sync || body.action === 'sync') {
    const { contacts } = await listContacts({ limit: 10000 });
    let added = 0;
    for (const c of contacts) {
      const before = await listCustomers();
      const had = before.some((x) => x.email === c.email);
      await upsertCustomer(c.email, {
        note: c.lastSubject ? `Last: ${c.lastSubject}` : '',
      });
      if (!had) added++;
    }
    const customers = await listCustomers();
    return Response.json({
      success: true,
      added,
      totalUnique: customers.length,
      message: `Synced ${contacts.length} inbox recipients. ${added} new. ${customers.length} total.`,
      customers,
    });
  }
  const email = String(body.email || '').trim().toLowerCase();
  if (!email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }
  await upsertCustomer(email, {
    name: body.name || '',
    note: body.note || '',
  });
  const customers = await listCustomers();
  return Response.json({ success: true, customers, totalUnique: customers.length });
}
