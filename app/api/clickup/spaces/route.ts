import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('teamId');
  if (!teamId) return NextResponse.json({ spaces: [] });
  
  try {
    const res = await fetch(
      `https://api.clickup.com/api/v2/team/${teamId}/space?archived=false`,
      { headers: { Authorization: process.env.CLICKUP_API_TOKEN! }, next: { revalidate: 60 } }
    );
    const data = await res.json();
    return NextResponse.json({ spaces: data.spaces ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
