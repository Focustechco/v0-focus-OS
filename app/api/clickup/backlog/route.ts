import { NextResponse } from 'next/server';
import { clickup } from '@/lib/clickup';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  if (!folderId) {
    return NextResponse.json({ error: 'folderId is required' }, { status: 400 });
  }

  try {
    const backlog = await clickup.getBacklog(folderId);
    return NextResponse.json(backlog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
