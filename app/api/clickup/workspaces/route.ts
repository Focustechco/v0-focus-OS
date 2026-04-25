import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.clickup.com/api/v2/team', {
      headers: { Authorization: process.env.CLICKUP_API_TOKEN! },
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return NextResponse.json({ workspaces: data.teams ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
