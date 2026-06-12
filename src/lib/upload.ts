import { createClient } from './supabase/client'

export interface UploadResult {
  url:  string
  path: string
  name: string
  size: number
  type: string
}

/**
 * Upload a file to Supabase Storage
 * Bucket: "submissions"
 * Path:   submissions/{taskCode}/{internId}/{uuid}_{filename}
 */
export async function uploadSubmissionFile(
  file: File,
  taskCode: string,
  internId: string,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const supabase = createClient()

  // Unique path to avoid collisions
  const ext      = file.name.split('.').pop()
  const uuid     = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path     = `${taskCode}/${internId}/${uuid}_${safeName}`

  // Simulate progress (Supabase JS client doesn't support native progress)
  // In production swap for XHR or tus-js-client for large video files
  let fakeProgress = 0
  const progressInterval = onProgress ? setInterval(() => {
    fakeProgress = Math.min(fakeProgress + 8, 90)
    onProgress(fakeProgress)
  }, 300) : null

  const { data, error } = await supabase.storage
    .from('submissions')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (progressInterval) clearInterval(progressInterval)
  if (onProgress) onProgress(100)

  if (error) throw new Error(`Upload failed: ${error.message}`)

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('submissions')
    .getPublicUrl(data.path)

  return {
    url:  urlData.publicUrl,
    path: data.path,
    name: file.name,
    size: file.size,
    type: file.type,
  }
}

/**
 * Upload a leave request attachment
 * Bucket: "leave-attachments" (private)
 */
export async function uploadLeaveAttachment(
  file: File,
  internId: string
): Promise<UploadResult> {
  const supabase = createClient()
  const uuid     = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path     = `${internId}/${uuid}_${safeName}`

  const { data, error } = await supabase.storage
    .from('leave-attachments')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: urlData } = supabase.storage
    .from('leave-attachments')
    .getPublicUrl(data.path)

  return { url: urlData.publicUrl, path: data.path, name: file.name, size: file.size, type: file.type }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/')
}

export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500MB
