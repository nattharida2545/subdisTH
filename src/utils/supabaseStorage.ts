import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket name (default: 'medications')
 * @returns The public URL of the uploaded file or null if upload failed
 */
export const uploadFileToStorage = async (
  file: File,
  bucket: string = 'medications'
): Promise<string | null> => {
  try {
    // Bucket must already exist (create via migration/Dashboard). Avoid listing/creating buckets on the client.

    // Generate a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream'
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFileToStorage:', error);
    return null;
  }
};

/**
 * Deletes a file from Supabase Storage
 * @param url The public URL of the file to delete
 * @param bucket The storage bucket name (default: 'medications')
 * @returns Boolean indicating success or failure
 */
export const deleteFileFromStorage = async (
  url: string,
  bucket: string = 'medications'
): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const filePath = pathSegments[pathSegments.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFileFromStorage:', error);
    return false;
  }
};
