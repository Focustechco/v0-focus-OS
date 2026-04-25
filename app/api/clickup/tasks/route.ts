import { NextRequest, NextResponse } from 'next/server';
import { getTasks } from '@/lib/clickup';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const listId = req.nextUrl.searchParams.get('listId');
  if (!listId) return NextResponse.json({ error: 'listId required' }, { status: 400 });

  try {
    const data = await getTasks(listId);

    // Try to cache in Supabase (non-blocking — works even if tables don't exist)
    try {
      const supabase = createServerClient();
      const rows = data.tasks.map((t: any) => ({
        id:            t.id,
        list_id:       listId,
        folder_id:     t.folder?.id ?? null,
        space_id:      t.space?.id ?? null,
        name:          t.name,
        status:        t.status?.status ?? null,
        priority:      t.priority?.priority ?? null,
        assignees:     t.assignees ?? [],
        due_date:      t.due_date   ? new Date(Number(t.due_date)).toISOString()   : null,
        start_date:    t.start_date ? new Date(Number(t.start_date)).toISOString() : null,
        tags:          t.tags ?? [],
        custom_fields: t.custom_fields ?? [],
        parent_id:     t.parent ?? null,
        raw:           t,
        synced_at:     new Date().toISOString(),
      }));

      if (rows.length > 0) {
        const { error: upsertErr } = await supabase.from('clickup_tasks_cache').upsert(rows, { onConflict: 'id' });
        if (upsertErr) console.warn('[Cache] Upsert skipped:', upsertErr.message);
      }
      const { error: logErr } = await supabase.from('sync_logs').insert({ source: 'clickup', status: 'success' });
      if (logErr) console.warn('[Cache] Sync log skipped:', logErr.message);
    } catch (cacheErr) {
      console.warn('[Cache] Supabase cache skipped:', (cacheErr as any).message);
    }

    return NextResponse.json({ tasks: data.tasks });
  } catch (err: any) {
    console.error('ClickUp Tasks Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
