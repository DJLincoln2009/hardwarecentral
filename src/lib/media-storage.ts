import { createImageKitClient, type ImageKitConfig } from './imagekit';

export function createMediaStorage(config: ImageKitConfig) {
  const imagekit = createImageKitClient(config);

  async function uploadImage(
    productId: string,
    filename: string,
    buffer: Buffer,
  ): Promise<{ url: string; checksum: string }> {
    return imagekit.uploadImage(productId, filename, buffer);
  }

  async function verifyLink(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  return { uploadImage, verifyLink };
}
