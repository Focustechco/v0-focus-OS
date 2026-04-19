export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export interface DriveFileList {
  files: DriveFile[];
  nextPageToken?: string;
}

export interface FolderNode {
  id: string;
  name: string;
  children?: FolderNode[];
  isExpanded?: boolean;
}

export interface DriveUploadResult {
  driveFileId: string;
  driveWebViewLink: string;
  fileName: string;
  size?: number;
  uploadedAt: Date;
  alreadyExists: boolean;
}
