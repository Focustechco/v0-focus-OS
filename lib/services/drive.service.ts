import { google } from "googleapis";
import { DriveFile, FolderNode } from "@/lib/types/drive";

export class DriveService {
  private drive;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"),
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    this.drive = google.drive({ version: "v3", auth });
  }

  async listFolderContents(folderId: string = "root"): Promise<DriveFile[]> {
    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, size, modifiedTime, webViewLink, thumbnailLink)",
      spaces: "drive",
    });
    return (response.data.files as DriveFile[]) || [];
  }

  async getFolderTree(rootId: string = "root"): Promise<FolderNode[]> {
    const response = await this.drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: "files(id, name, parents)",
    });
    
    const folders = response.data.files || [];
    const buildTree = (parentId: string | null = rootId): FolderNode[] => {
      return folders
        .filter(f => f.parents?.includes(parentId || ""))
        .map(f => ({
          id: f.id!,
          name: f.name!,
          children: buildTree(f.id!)
        }));
    };

    return buildTree(rootId);
  }

  async uploadFile(folderId: string, fileName: string, content: Buffer, mimeType: string) {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    const media = {
      mimeType: mimeType,
      body: Readable.from(content),
    };
    
    const file = await this.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    return file.data;
  }
}

// Support for Readable stream
import { Readable } from 'stream';
