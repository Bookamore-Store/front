export const MAX_PHOTO_SIZE = 20 * 1024 * 1024;
const HEIC_PHOTO_EXTENSIONS = /\.(heif|heic)$/i;
const HEIF_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'hevm',
  'hevs',
  'mif1',
  'msf1',
]);

type PhotoFormat = 'jpeg' | 'png' | 'webp' | 'heif';

export const getPhotoFormatFromExtension = (
  fileName: string
): PhotoFormat | null => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'jpg' || extension === 'jpeg') return 'jpeg';
  if (extension === 'png') return 'png';
  if (extension === 'webp') return 'webp';
  if (extension === 'heif' || extension === 'heic') return 'heif';

  return null;
};

export const getPhotoFormatFromContent = async (
  file: File
): Promise<PhotoFormat | null> => {
  const bytes = new Uint8Array(await file.slice(0, 64 * 1024).arrayBuffer());

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'jpeg';
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png';
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    return 'webp';
  }

  if (
    bytes.length >= 16 &&
    String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp'
  ) {
    const boxSize = new DataView(bytes.buffer).getUint32(0);
    const boxEnd = Math.min(boxSize || bytes.length, bytes.length);

    for (let offset = 8; offset + 4 <= boxEnd; offset += 4) {
      const brand = String.fromCharCode(...bytes.slice(offset, offset + 4));
      if (HEIF_BRANDS.has(brand)) return 'heif';
    }
  }

  return null;
};

export const isHeicPhoto = (file: File): boolean =>
  file.type.toLowerCase() === 'image/heic' ||
  file.type.toLowerCase() === 'image/heif' ||
  HEIC_PHOTO_EXTENSIONS.test(file.name);

export const convertHeicToJpeg = async (file: File): Promise<Blob> => {
  const { default: convert } = await import('heic-convert/browser');
  const converted = await convert({
    buffer: new Uint8Array(await file.arrayBuffer()),
    format: 'JPEG',
    quality: 0.8,
  });
  const jpegBuffer = new ArrayBuffer(converted.byteLength);
  new Uint8Array(jpegBuffer).set(converted);

  return new Blob([jpegBuffer], { type: 'image/jpeg' });
};

export const getImageDimensions = async (
  blob: Blob
): Promise<{ width: number; height: number }> => {
  const imageUrl = URL.createObjectURL(blob);

  try {
    const image = new Image();
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        image.onload = () =>
          resolve({
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
        image.onerror = () => reject(new Error('Failed to decode image.'));
        image.src = imageUrl;
      }
    );

    return dimensions;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};
