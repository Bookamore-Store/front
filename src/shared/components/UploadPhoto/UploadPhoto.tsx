import {
  useState,
  type ChangeEvent,
  useEffect,
  useRef,
  useId,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { CrossSvg } from '@/shared/ui/icons/CrossSvg';
import { AddPhotoBook } from '@/shared/ui/icons/AddPhotoBookSvg';
import { Spinner } from '@/shared/ui/Spinner';
import { AlertSvg } from '@/shared/ui/icons/AlertSvg';

interface ExistingImage {
  id: string;
  path: string;
}

export type OrderedPhoto =
  | { type: 'existing'; image: ExistingImage }
  | { type: 'new'; file: File };

type PhotoItem =
  | {
      type: 'existing';
      image: ExistingImage;
      previewState: 'loading' | 'ready' | 'failed';
    }
  | {
      type: 'new';
      file: File;
      previewUrl: string;
      previewId: number;
      previewState: 'processing' | 'loading' | 'ready' | 'failed';
    };

type PreviewState = 'loading' | 'ready' | 'failed';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';
const MAX_PHOTOS = 6;
const MAX_PHOTO_SIZE = 20 * 1024 * 1024;
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

const getPhotoFormatFromExtension = (fileName: string): PhotoFormat | null => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'jpg' || extension === 'jpeg') return 'jpeg';
  if (extension === 'png') return 'png';
  if (extension === 'webp') return 'webp';
  if (extension === 'heif' || extension === 'heic') return 'heif';

  return null;
};

const getPhotoFormatFromContent = async (
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

const getImagePreviewUrl = (path?: string) => {
  if (!path) return '';

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${IMAGE_HOST}${normalizedPath}`;
};

interface UploadPhotoProps {
  onPhotosChange?: (photos: File[]) => void;
  initialExistingImages?: ExistingImage[];
  onExistingImagesChange?: (images: ExistingImage[]) => void;
  onImagesOrderChange?: (images: OrderedPhoto[]) => void;
}

const UploadPhoto: React.FC<UploadPhotoProps> = ({
  onPhotosChange,
  initialExistingImages = [],
  onExistingImagesChange,
  onImagesOrderChange,
}) => {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const draggingIndex = useRef<number | null>(null);
  const draggingPointerId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoListRef = useRef<HTMLUListElement>(null);
  const itemsRef = useRef(items);
  const nextPreviewIdRef = useRef(0);
  const isMountedRef = useRef(false);
  const callbacksRef = useRef({
    onPhotosChange,
    onExistingImagesChange,
    onImagesOrderChange,
  });
  const touchGesture = useRef<{
    identifier: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    timer: number;
    isDragging: boolean;
  } | null>(null);
  const inputId = useId();
  const [uploadError, setUploadError] = useState('');
  const [dragPreview, setDragPreview] = useState<{
    item: PhotoItem;
    x: number;
    y: number;
  } | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      itemsRef.current.forEach((item) => {
        if (item.type === 'new') {
          if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
        }
      });
    };
  }, []);

  useEffect(() => {
    callbacksRef.current = {
      onPhotosChange,
      onExistingImagesChange,
      onImagesOrderChange,
    };
  }, [onPhotosChange, onExistingImagesChange, onImagesOrderChange]);

  useEffect(() => {
    setItems((currentItems) => {
      const currentIds = currentItems
        .filter(
          (item): item is Extract<PhotoItem, { type: 'existing' }> =>
            item.type === 'existing'
        )
        .map(({ image }) => image.id);
      const initialIds = initialExistingImages.map(({ id }) => id);

      if (
        currentIds.length === initialIds.length &&
        currentIds.every((id, index) => id === initialIds[index])
      ) {
        return currentItems;
      }

      return [
        ...initialExistingImages.map(
          (image): PhotoItem => ({
            type: 'existing',
            image,
            previewState: 'loading',
          })
        ),
        ...currentItems.filter((item) => item.type === 'new'),
      ];
    });
  }, [initialExistingImages]);

  const updateItems = useCallback((nextItems: PhotoItem[]) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
    callbacksRef.current.onPhotosChange?.(
      nextItems.flatMap((item) => (item.type === 'new' ? [item.file] : []))
    );
    callbacksRef.current.onExistingImagesChange?.(
      nextItems.flatMap((item) =>
        item.type === 'existing' ? [item.image] : []
      )
    );
    callbacksRef.current.onImagesOrderChange?.(
      nextItems.map((item) =>
        item.type === 'existing'
          ? { type: 'existing', image: item.image }
          : { type: 'new', file: item.file }
      )
    );
  }, []);

  const updatePreviewItem = useCallback(
    (
      previewId: number | string,
      previewState: PreviewState,
      previewUrl?: string
    ) => {
      const currentItems = itemsRef.current;
      const itemExists = currentItems.some(
        (item) =>
          (item.type === 'new' ? item.previewId : item.image.id) === previewId
      );
      if (!itemExists) return false;

      const nextItems = currentItems.map((item): PhotoItem => {
        const itemId = item.type === 'new' ? item.previewId : item.image.id;
        if (itemId !== previewId) return item;

        return item.type === 'new'
          ? {
              ...item,
              previewState,
              ...(previewUrl !== undefined ? { previewUrl } : {}),
            }
          : { ...item, previewState };
      });

      itemsRef.current = nextItems;
      setItems(nextItems);
      return true;
    },
    []
  );

  useEffect(() => {
    const photos =
      photoListRef.current?.querySelectorAll<HTMLLIElement>(
        '[data-photo-index]'
      );
    if (!photos) return;

    items.forEach((item, index) => {
      if (item.previewState !== 'loading' || !getPreviewUrl(item)) return;

      const image = photos[index]?.querySelector('img');
      if (image?.complete) {
        const previewId = item.type === 'new' ? item.previewId : item.image.id;
        updatePreviewItem(
          previewId,
          image.naturalWidth > 0 ? 'ready' : 'failed'
        );
      }
    });
  }, [items, updatePreviewItem]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    e.target.value = '';
    const validFiles: File[] = [];
    const errors = new Set<string>();

    for (const file of selectedFiles) {
      if (file.size > MAX_PHOTO_SIZE) {
        errors.add(t('sellBook.photoTooLarge'));
        continue;
      }

      const extensionFormat = getPhotoFormatFromExtension(file.name);
      if (!extensionFormat) {
        errors.add(t('sellBook.photoUnsupportedFormat'));
        continue;
      }

      try {
        const contentFormat = await getPhotoFormatFromContent(file);
        if (contentFormat !== extensionFormat) {
          errors.add(t('sellBook.photoUnsupportedFormat'));
          continue;
        }
      } catch (error) {
        console.error('Failed to validate photo file contents.', error);
        errors.add(t('sellBook.photoUnsupportedFormat'));
        continue;
      }

      validFiles.push(file);
    }

    const remainingSlots = Math.max(0, MAX_PHOTOS - itemsRef.current.length);
    if (validFiles.length > remainingSlots) {
      errors.add(t('sellBook.photoLimitReached'));
    }

    const acceptedFiles = validFiles.slice(0, remainingSlots);
    const newItems = acceptedFiles.map((file): PhotoItem => {
      const isHeic =
        file.type.toLowerCase() === 'image/heic' ||
        file.type.toLowerCase() === 'image/heif' ||
        HEIC_PHOTO_EXTENSIONS.test(file.name);

      return {
        type: 'new',
        file,
        previewId: nextPreviewIdRef.current++,
        previewUrl: isHeic ? '' : URL.createObjectURL(file),
        previewState: isHeic ? 'processing' : 'loading',
      };
    });

    if (newItems.length > 0) {
      updateItems([...itemsRef.current, ...newItems]);
    }
    setUploadError(Array.from(errors).join(' '));

    await Promise.all(
      newItems.flatMap((item) => {
        if (item.type !== 'new' || item.previewState !== 'processing') {
          return [];
        }

        return [
          (async () => {
            try {
              const { default: convert } = await import('heic-convert/browser');
              const converted = await convert({
                buffer: new Uint8Array(await item.file.arrayBuffer()),
                format: 'JPEG',
                quality: 0.8,
              });
              const jpegBuffer = new ArrayBuffer(converted.byteLength);
              new Uint8Array(jpegBuffer).set(converted);
              const previewUrl = URL.createObjectURL(
                new Blob([jpegBuffer], { type: 'image/jpeg' })
              );

              if (!isMountedRef.current) {
                URL.revokeObjectURL(previewUrl);
                return;
              }

              if (!updatePreviewItem(item.previewId, 'loading', previewUrl)) {
                URL.revokeObjectURL(previewUrl);
              }
            } catch (error) {
              console.error(
                'Failed to generate HEIC/HEIF photo preview.',
                error
              );
              if (isMountedRef.current) {
                updatePreviewItem(item.previewId, 'failed');
                setUploadError((currentError) =>
                  [currentError, t('sellBook.photoPreviewFailed')]
                    .filter(Boolean)
                    .join(' ')
                );
              }
            }
          })(),
        ];
      })
    );
  };

  const handleDelete = (index: number) => {
    const item = items[index];
    if (item?.type === 'new' && item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    updateItems(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    if (
      event.pointerType === 'touch' ||
      event.button !== 0 ||
      (event.target as HTMLElement).closest('button')
    ) {
      return;
    }

    const item = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-photo-index]'
    );
    if (!item) return;

    draggingIndex.current = Number(item.dataset.photoIndex);
    draggingPointerId.current = event.pointerId;
    const draggedItem = items[draggingIndex.current];
    if (draggedItem) {
      setDragPreview({
        item: draggedItem,
        x: event.clientX,
        y: event.clientY,
      });
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    if (draggingPointerId.current !== event.pointerId) return;
    setDragPreview((current) =>
      current ? { ...current, x: event.clientX, y: event.clientY } : current
    );

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-photo-index]');
    if (!target) return;

    const targetIndex = Number(target.dataset.photoIndex);
    const sourceIndex = draggingIndex.current;
    if (
      sourceIndex === null ||
      targetIndex === sourceIndex ||
      targetIndex >= items.length
    ) {
      return;
    }

    const nextItems = [...items];
    const [draggedItem] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, draggedItem);
    draggingIndex.current = targetIndex;
    updateItems(nextItems);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLUListElement>) => {
    if (draggingPointerId.current !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingIndex.current = null;
    draggingPointerId.current = null;
    setDragPreview(null);
  };

  useEffect(() => {
    const list = photoListRef.current;
    if (!list) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;

      const target = event.target;
      if (!(target instanceof Element) || target.closest('button')) return;

      const photo = target.closest<HTMLElement>('[data-photo-index]');
      if (!photo) return;

      const touch = event.touches[0];
      const gesture = {
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastY: touch.clientY,
        timer: 0,
        isDragging: false,
      };
      touchGesture.current = gesture;
      const photoIndex = Number(photo.dataset.photoIndex);

      gesture.timer = window.setTimeout(() => {
        if (touchGesture.current !== gesture) return;

        const draggedItem = itemsRef.current[photoIndex];
        if (!draggedItem) return;

        gesture.isDragging = true;
        draggingIndex.current = photoIndex;
        setDragPreview({
          item: draggedItem,
          x: gesture.lastX,
          y: gesture.lastY,
        });
      }, 200);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const gesture = touchGesture.current;
      if (!gesture) return;

      const touch = Array.from(event.touches).find(
        ({ identifier }) => identifier === gesture.identifier
      );
      if (!touch) return;

      gesture.lastX = touch.clientX;
      gesture.lastY = touch.clientY;

      if (!gesture.isDragging) {
        if (
          Math.hypot(
            touch.clientX - gesture.startX,
            touch.clientY - gesture.startY
          ) > 8
        ) {
          window.clearTimeout(gesture.timer);
          touchGesture.current = null;
        }
        return;
      }

      event.preventDefault();
      setDragPreview((current) =>
        current ? { ...current, x: touch.clientX, y: touch.clientY } : current
      );

      const target = document
        .elementFromPoint(touch.clientX, touch.clientY)
        ?.closest<HTMLElement>('[data-photo-index]');
      if (!target) return;

      const targetIndex = Number(target.dataset.photoIndex);
      const sourceIndex = draggingIndex.current;
      const currentItems = itemsRef.current;
      if (
        sourceIndex === null ||
        targetIndex === sourceIndex ||
        targetIndex >= currentItems.length
      ) {
        return;
      }

      const nextItems = [...currentItems];
      const [draggedItem] = nextItems.splice(sourceIndex, 1);
      nextItems.splice(targetIndex, 0, draggedItem);
      draggingIndex.current = targetIndex;
      updateItems(nextItems);
    };

    const finishTouchGesture = (event: TouchEvent) => {
      const gesture = touchGesture.current;
      if (
        !gesture ||
        !Array.from(event.changedTouches).some(
          ({ identifier }) => identifier === gesture.identifier
        )
      ) {
        return;
      }

      window.clearTimeout(gesture.timer);
      touchGesture.current = null;
      if (gesture.isDragging) {
        draggingIndex.current = null;
        setDragPreview(null);
      }
    };

    list.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    document.addEventListener('touchend', finishTouchGesture);
    document.addEventListener('touchcancel', finishTouchGesture);

    return () => {
      list.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', finishTouchGesture);
      document.removeEventListener('touchcancel', finishTouchGesture);
      if (touchGesture.current) {
        window.clearTimeout(touchGesture.current.timer);
        touchGesture.current = null;
      }
    };
  }, [updateItems]);

  const getPreviewUrl = (item: PhotoItem) =>
    item.type === 'existing'
      ? getImagePreviewUrl(item.image.path)
      : item.previewUrl;

  const renderPhoto = (item: PhotoItem, index: number) => {
    const previewUrl = getPreviewUrl(item);
    const previewId = item.type === 'new' ? item.previewId : item.image.id;

    return (
      <li
        key={item.type === 'existing' ? item.image.id : item.previewId}
        data-photo-index={index}
        className="relative aspect-[0.8] min-w-0 select-none overflow-visible rounded-[10px] bg-[#F7F8F2] [-webkit-touch-callout:none]"
        onContextMenu={(event) => event.preventDefault()}
      >
        {previewUrl && item.previewState !== 'failed' ? (
          <img
            src={previewUrl}
            alt={`photo-${index}`}
            className="h-full w-full rounded-[10px] object-cover"
            draggable={false}
            onLoad={() => updatePreviewItem(previewId, 'ready')}
            onError={() => updatePreviewItem(previewId, 'failed')}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center rounded-[10px]"
            role="img"
            aria-label={t('sellBook.photoPreviewFailed')}
          >
            <AddPhotoBook />
          </div>
        )}
        {(item.previewState === 'processing' ||
          item.previewState === 'loading') && (
          <div
            className="absolute inset-0 z-[5] flex items-center justify-center rounded-[10px]"
            role="status"
            aria-label={t(
              'sellBook.photoPreviewLoading',
              'Preparing photo preview'
            )}
          >
            <Spinner size="md" />
          </div>
        )}
        <button
          className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-[10px] border border-icons-black bg-grass-50 text-text-black"
          onClick={() => handleDelete(index)}
          type="button"
          aria-label={t('sellBook.removePhoto', 'Remove photo')}
        >
          <CrossSvg size={20} />
        </button>
      </li>
    );
  };

  return (
    <section className="w-full rounded-xl border border-[#D9DEDA] p-2">
      <h3 className="text-[17px] font-semibold leading-6 text-[#153037]">
        {t('sellBook.uploadPhoto')}
      </h3>
      <p className="mt-1 mb-4 text-[12px] leading-[17px] text-[#153037]">
        {t('sellBook.photoUploadLimit')}
        <br />
        {t('sellBook.photoUploadFormats')}
      </p>
      {uploadError && (
        <div className="flex md:inline-flex items-center gap-2 p-3 border border-error rounded-xl">
          <AlertSvg className="flex-shrink-0" />
          <p role="alert" className="text-xs font-normal text-text-black">
            {uploadError}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        id={inputId}
        onChange={handleChange}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heif,image/heic"
        className="sr-only"
        multiple
      />

      <ul
        ref={photoListRef}
        className="mt-5 grid touch-auto grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 px-10 pb-2"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {items.map(renderPhoto)}
        {Array.from({ length: 6 - items.length }).map((_, index) => (
          <li key={`empty-${index}`} className="aspect-[0.8] min-w-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('sellBook.addPhoto', 'Add photo')}
              className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#F7F8F2]"
            >
              <AddPhotoBook />
            </button>
          </li>
        ))}
      </ul>
      {dragPreview && getPreviewUrl(dragPreview.item) && (
        <img
          src={getPreviewUrl(dragPreview.item)}
          alt=""
          aria-hidden="true"
          className="pointer-events-none fixed z-50 h-[96px] w-[72px] rotate-8 -translate-x-1/2 -translate-y-1/2 rounded-[10px] object-cover opacity-90 shadow-xl"
          style={{ left: dragPreview.x, top: dragPreview.y }}
          draggable={false}
        />
      )}
    </section>
  );
};

export default UploadPhoto;
