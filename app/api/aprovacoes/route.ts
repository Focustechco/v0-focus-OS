import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createComment } from '@/lib/clickup';

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const project  = req.nextUrl.searchParams.get('project');

  let query = supabase
    .from('approvals')
    .select('*, clickup_tasks_cache(*)')
    .order('created_at', { ascending: false });

  if (project) query = query.eq('project_name', project);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ approvals: data });
}

export async function PATCH(req: NextRequest) {
  const { id, status, notes, clickup_task_id } = await req.json();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('approvals')
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Comenta na tarefa do ClickUp
  if (clickup_task_id) {
    const emoji = status === 'approved' ? '✅' : '❌';
    const label = status === 'approved' ? 'Aprovado' : 'Rejeitado';
    await createComment(
      clickup_task_id,
      `${emoji} ${label} via Focus OS${notes ? `: ${notes}` : ''}`
    ).catch(() => {});
  }

  return NextResponse.json({ approval: data });
}
