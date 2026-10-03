const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

export function getImageUrl(path?: string | null): string {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_HOST}${normalizedPath}`;
}
