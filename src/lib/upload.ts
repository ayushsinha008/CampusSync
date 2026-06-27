import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.zip', '.png', '.jpg', '.jpeg', '.txt']);
const MAX_BYTES = 10 * 1024 * 1024;

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

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const storedName = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, storedName), buffer);

  return {
    url: `/uploads/${subdir}/${storedName}`,
    fileName: file.name,
  };
}
