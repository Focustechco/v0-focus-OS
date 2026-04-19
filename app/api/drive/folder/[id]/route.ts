import { NextResponse } from "next/server";
import { DriveService } from "@/lib/services/drive.service";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const folderId = params.id;

  try {
    const drive = new DriveService();
    const files = await drive.listFolderContents(folderId);
    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
