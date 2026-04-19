import { NextResponse } from "next/server";
import { DriveService } from "@/lib/services/drive.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rootId = searchParams.get("rootId") || "root";

  try {
    const drive = new DriveService();
    const tree = await drive.getFolderTree(rootId);
    return NextResponse.json(tree);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
