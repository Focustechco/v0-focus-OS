import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const spaceId = req.nextUrl.searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ lists: [] });
  
  const h = { Authorization: process.env.CLICKUP_API_TOKEN!, 'Content-Type': 'application/json' };
  const opts = { headers: h, next: { revalidate: 60 } };

  try {
    const [foldersRes, folderlessRes] = await Promise.all([
      fetch(`https://api.clickup.com/api/v2/space/${spaceId}/folder?archived=false`, opts),
      fetch(`https://api.clickup.com/api/v2/space/${spaceId}/list?archived=false`, opts),
    ]);
    const { folders }  = await foldersRes.json();
    const { lists: fl } = await folderlessRes.json();

    const folderLists = await Promise.all(
      (folders ?? []).map(async (f: any) => {
        const r = await fetch(
          `https://api.clickup.com/api/v2/folder/${f.id}/list?archived=false`, opts
        );
        const d = await r.json();
        return (d.lists ?? []).map((l: any) => ({ ...l, folder_name: f.name }));
      })
    );
    
    const all = [...(fl ?? []), ...folderLists.flat()];
    return NextResponse.json({ lists: all });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
