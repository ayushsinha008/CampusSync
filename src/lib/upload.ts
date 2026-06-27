import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.zip', '.png', '.jpg', '.jpeg', '.webp', '.txt']);
const MAX_BYTES = 10 * 1024 * 1024;
const IS_SERVERLESS = !!process.env.VERCEL;

const MIME_BY_EXT: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
};

export async function saveUpload(file: File, subdir: string) {
  if (!file || file.size === 0) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_BYTES) {
    throw new Error('File must be 10MB or smaller');
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Allowed types: PDF, DOC, DOCX, ZIP, PNG, JPG, TXT');
  }

  // Vercel: store compact data URLs only (avatars must stay out of JWT cookies).
  if (IS_SERVERLESS && subdir === 'avatars' && file.size > 200 * 1024) {
    throw new Error('Profile photo must be 200KB or smaller on cloud deploy');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Vercel serverless: ephemeral disk — store as data URL in MongoDB instead.
  if (IS_SERVERLESS) {
    const mime = file.type || MIME_BY_EXT[ext] || 'application/octet-stream';
    const base64 = buffer.toString('base64');
    return {
      url: `data:${mime};base64,${base64}`,
      fileName: file.name,
    };
  }

  const storedName = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, storedName), buffer);

  return {
    url: `/uploads/${subdir}/${storedName}`,
    fileName: file.name,
  };
}
