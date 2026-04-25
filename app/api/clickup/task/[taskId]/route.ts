import { NextRequest, NextResponse } from 'next/server';
import { updateTaskStatus } from '@/lib/clickup';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const { status } = await req.json();
  try {
    const updated = await updateTaskStatus(params.taskId, status);
    return NextResponse.json({ task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
