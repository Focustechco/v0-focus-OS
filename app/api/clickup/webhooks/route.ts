import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getTask } from '@/lib/clickup';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('x-signature') ?? '';

  // Validate signature if secret is configured
  if (process.env.CLICKUP_WEBHOOK_SECRET) {
    const expected = createHmac('sha256', process.env.CLICKUP_WEBHOOK_SECRET)
      .update(body).digest('hex');
    if (sig !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const payload = JSON.parse(body);
  const supabase = createServerClient();

  const taskEvents = ['taskCreated', 'taskUpdated', 'taskStatusUpdated', 'taskDeleted'];

  if (taskEvents.includes(payload.event) && payload.task_id) {
    if (payload.event === 'taskDeleted') {
      await supabase.from('clickup_tasks_cache').delete().eq('id', payload.task_id);
    } else {
      try {
        const task = await getTask(payload.task_id);
        await supabase.from('clickup_tasks_cache').upsert({
          id:            task.id,
          list_id:       task.list?.id ?? null,
          folder_id:     task.folder?.id ?? null,
          space_id:      task.space?.id ?? null,
          name:          task.name,
          status:        task.status?.status ?? null,
          priority:      task.priority?.priority ?? null,
          assignees:     task.assignees ?? [],
          due_date:      task.due_date   ? new Date(Number(task.due_date)).toISOString()   : null,
          start_date:    task.start_date ? new Date(Number(task.start_date)).toISOString() : null,
          tags:          task.tags ?? [],
          custom_fields: task.custom_fields ?? [],
          parent_id:     task.parent ?? null,
          raw:           task,
          synced_at:     new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (err: any) {
        console.error('Webhook task fetch error:', err.message);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
