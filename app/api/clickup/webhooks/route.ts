import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const signature = request.headers.get('x-signature');
  const body = await request.text();

  // Validate webhook signature
  if (process.env.CLICKUP_WEBHOOK_SECRET) {
    const hash = crypto
      .createHmac('sha256', process.env.CLICKUP_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  const payload = JSON.parse(body);
  const { event, task_id, webhook_id } = payload;

  console.log(`Received ClickUp webhook: ${event} for task ${task_id}`);

  // Handle task events by updating the Supabase cache
  if (event === 'taskCreated' || event === 'taskUpdated' || event === 'taskStatusUpdated') {
    // We would typically fetch the full task details here or use the payload if it's sufficient
    // For now, we'll mark it as needing sync or do a basic upsert if data is present
    
    // Example: Upsert into clickup_tasks_cache (Schema needs to be created in PASSO 3)
    /*
    await supabase.from('clickup_tasks_cache').upsert({
      id: task_id,
      // ... fill other fields from payload if available or fetch from ClickUp
      synced_at: new Date().toISOString()
    });
    */
  }

  // Log the sync
  await supabase.from('sync_logs').insert({
    event_type: event,
    external_id: task_id,
    source: 'clickup_webhook',
    status: 'success',
    payload: payload
  });

  return NextResponse.json({ received: true });
}
