import { NextResponse } from 'next/server';
import { clickup } from '@/lib/clickup';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listId = searchParams.get('listId');

  if (!listId) {
    return NextResponse.json({ error: 'listId is required' }, { status: 400 });
  }

  try {
    const sprints = await clickup.getSprints(listId);
    return NextResponse.json(sprints);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
