import { createHash } from 'crypto';

export interface ImageKitConfig {
  publicKey: string;
  privateKey?: string;
  urlEndpoint: string;
}

export function createImageKitClient(config: ImageKitConfig) {
  function getUrl(path: string): string {
    const base = config.urlEndpoint.replace(/\/$/, '');
    return `${base}/${path.replace(/^\//, '')}`;
  }

  async function uploadImage(
    productId: string,
    filename: string,
    buffer: Buffer,
  ): Promise<{ url: string; checksum: string }> {
    if (!config.privateKey) {
      throw new Error('ImageKit privateKey required for uploads. Configure it in .env.local');
    }

    const b64 = buffer.toString('base64');
    const formData = new URLSearchParams();
    formData.set('file', b64);
    formData.set('fileName', `products/${productId}/images/${filename}`);
    formData.set('useUniqueFileName', 'false');
    formData.set('folder', `/products/${productId}/images`);

    const auth = Buffer.from(`${config.privateKey}:`).toString('base64');

    const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ImageKit upload failed: ${res.status} ${err}`);
    }

    const data = await res.json();
    const checksum = createHash('sha256').update(buffer).digest('hex');

    return { url: data.url, checksum };
  }

  return { getUrl, uploadImage };
}
