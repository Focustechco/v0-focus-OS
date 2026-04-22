import { NextResponse } from "next/server"
import { clickupFetch } from "@/lib/clickup-server"
import { requireUser } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const spaceId = searchParams.get('spaceId')

  if (!spaceId) {
    return NextResponse.json({ error: "spaceId é obrigatório" }, { status: 400 })
  }

  try {
    // Busca listas diretas no space
    const spaceListsData = await clickupFetch<{ lists: any[] }>(`/space/${spaceId}/list`)
    
    // Busca folders no space para pegar listas dentro deles
    const foldersData = await clickupFetch<{ folders: any[] }>(`/space/${spaceId}/folder`)
    
    let allLists = [...(spaceListsData.lists || [])]
    
    // Para cada folder, busca as listas
    for (const folder of foldersData.folders || []) {
      const folderListsData = await clickupFetch<{ lists: any[] }>(`/folder/${folder.id}/list`)
      allLists = [...allLists, ...(folderListsData.lists || [])]
    }

    return NextResponse.json({ lists: allLists })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
