import { NextResponse } from 'next/server';
import { clickup } from '@/lib/clickup';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listId = searchParams.get('listId');
  
  if (!listId) {
    return NextResponse.json({ error: 'listId is required' }, { status: 400 });
  }

  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== 'listId') params[key] = value;
  });

  try {
    const tasks = await clickup.getTasks(listId, params);
    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
