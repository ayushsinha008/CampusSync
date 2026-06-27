/** Keep JWT/session cookies small — never embed base64 avatars in the session token. */
export function isStorableSessionImage(image?: string | null): boolean {
  if (!image) return false;
  if (image.startsWith('data:')) return false;
  return image.length <= 512;
}
