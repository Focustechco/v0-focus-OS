import { NextResponse } from 'next/server';
import { clickup } from '@/lib/clickup';

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const task = await clickup.getTask(params.taskId);
    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const data = await request.json();
    const updatedTask = await clickup.updateTask(params.taskId, data);
    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
