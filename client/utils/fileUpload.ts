import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export interface AttachmentData {
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
}

// Helper function to get file extension
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

// Helper function to generate unique filename
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitizedName}_${timestamp}_${randomStr}.${extension}`;
}

// Helper function to get storage folder based on file type
export function getStorageFolder(fileType: string): string {
  if (fileType.startsWith('image/')) return 'images';
  if (fileType.startsWith('video/')) return 'videos';
  if (fileType.startsWith('audio/')) return 'audio';
  if (fileType.includes('pdf')) return 'documents';
  if (fileType.includes('document') || fileType.includes('text') || fileType.includes('sheet')) return 'documents';
  return 'files';
}

// Upload a single file to Supabase Storage
export async function uploadFileToStorage(file: File): Promise<AttachmentData> {
  // Generate unique filename and determine storage path
  const uniqueFileName = generateUniqueFileName(file.name);
  const storageFolder = getStorageFolder(file.type);
  const storagePath = `${storageFolder}/${uniqueFileName}`;

  // Convert file to buffer
  const fileBuffer = await file.arrayBuffer();

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('message-attachments')
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      duplex: 'half'
    });

  if (uploadError) {
    console.error('Error uploading file to storage:', uploadError);
    throw new Error(`Error uploading file ${file.name}: ${uploadError.message}`);
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from('message-attachments')
    .getPublicUrl(storagePath);

  if (!publicUrlData.publicUrl) {
    throw new Error(`Error getting public URL for file ${file.name}`);
  }

  return {
    file_url: publicUrlData.publicUrl,
    file_type: file.type,
    file_name: file.name,
    file_size: file.size,
    width: null,
    height: null
  };
}

// Upload multiple files to storage
export async function uploadFilesToStorage(files: File[]): Promise<AttachmentData[]> {
  const uploadedAttachments: AttachmentData[] = [];

  for (const file of files) {
    const attachment = await uploadFileToStorage(file);
    uploadedAttachments.push(attachment);
  }

  return uploadedAttachments;
}

// Clean up files from storage by URLs
export async function cleanupFilesFromStorage(fileUrls: string[]): Promise<void> {
  try {
    const pathsToDelete = fileUrls.map(url => {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').slice(-2).join('/'); // Get folder/filename from URL
    });
    
    await supabase.storage
      .from('message-attachments')
      .remove(pathsToDelete);
  } catch (cleanupError) {
    console.error('Error cleaning up files from storage:', cleanupError);
    throw cleanupError;
  }
}

// Delete a single file from storage by URL
export async function deleteFileFromStorage(fileUrl: string): Promise<void> {
  await cleanupFilesFromStorage([fileUrl]);
} 