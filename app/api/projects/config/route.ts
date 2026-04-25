import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

const CONFIG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('projects_clickup_config')
    .select('*')
    .eq('id', CONFIG_ID)
    .single();
    
  return NextResponse.json({ config: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('projects_clickup_config')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', CONFIG_ID)
    .select()
    .single();
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ config: data });
}
