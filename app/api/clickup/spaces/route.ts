import { NextRequest, NextResponse } from 'next/server';
import { getSpaces, getFolders, getLists, getFolderlessLists } from '@/lib/clickup';

// Retorna toda a árvore: spaces > folders > lists
export async function GET() {
  try {
    const teamId = process.env.CLICKUP_TEAM_ID!;
    const { spaces } = await getSpaces(teamId);

    const tree = await Promise.all(
      spaces.map(async (space: any) => {
        const [{ folders }, { lists: folderless }] = await Promise.all([
          getFolders(space.id),
          getFolderlessLists(space.id),
        ]);
        const foldersWithLists = await Promise.all(
          folders.map(async (folder: any) => {
            const { lists } = await getLists(folder.id);
            return { ...folder, lists };
          })
        );
        return {
          ...space,
          folders: foldersWithLists,
          folderless_lists: folderless,
        };
      })
    );

    return NextResponse.json({ spaces: tree });
  } catch (err: any) {
    console.error('ClickUp Spaces Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
