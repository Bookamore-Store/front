import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CrossSvg } from '@/shared/ui/icons/CrossSvg';
import type { image } from '@/types/entities/Book';
import noImages from '@/assest/images/noImage.jpg';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

type Props = {
  images: image[];
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  title: string;
  onClose: () => void;
};

export const ImageGalleryModal = ({
  images,
  index,
  setIndex,
  title,
  onClose,
}: Props) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  const hasMultiple = images.length > 1;

  const previous = () =>
    setIndex((current) => (current - 1 + images.length) % images.length);
  const next = () => setIndex((current) => (current + 1) % images.length);
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Node;

    if (imageRef.current?.contains(target)) return;

    onClose();
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const priorFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeCallback.current();
      } else if (images.length > 1 && event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((current) => (current - 1 + images.length) % images.length);
      } else if (images.length > 1 && event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex((current) => (current + 1) % images.length);
      } else if (event.key === 'Tab') {
        const buttons = Array.from(
          modalRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []
        );
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      priorFocus?.focus();
    };
  }, [images.length, setIndex]);

  const currentImage = images[index];
  const src = currentImage
    ? /^(https?:)?\/\//.test(currentImage.path)
      ? currentImage.path
      : `${IMAGE_HOST}${currentImage.path}`
    : noImages;

  return createPortal(
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 px-5 py-5 sm:px-10 sm:py-6 backdrop-blur-[2px]"
      onClick={handleBackdropClick}
    >
      <div className="flex h-full w-full max-w-[1400px] flex-col items-center justify-center gap-4">
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="absolute flex justify-center items-center w-[28px] h-[28px] -right-2 -top-2 z-10 text-text-black bg-gray-300 rounded-full transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
          >
            <CrossSvg size={22} />
          </button>
          <div className="relative flex h-full w-full items-center justify-center overflow-visible rounded-xl">
            <img
              ref={imageRef}
              src={src}
              alt={title}
              className="block max-w-full max-h-full w-auto h-auto object-contain bg-white rounded-xl"
            />
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    previous();
                  }}
                  aria-label="Previous image"
                  className="absolute left-0 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-300 text-text-black shadow-md transition hover:opacity-70 cursor-pointer"
                >
                  <ChevronLeft size={23} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next image"
                  className="absolute right-0 top-1/2 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-300 text-text-black shadow-md transition hover:opacity-70 cursor-pointer"
                >
                  <ChevronRight size={23} />
                </button>
              </>
            )}
          </div>
        </div>
        {hasMultiple && (
          <div
            className="flex w-full justify-center max-w-[min(100%,700px)] gap-3 overflow-x-auto px-1 py-1"
            aria-label="Image thumbnails"
          >
            {images.map((item, itemIndex) => {
              const thumbSrc = /^(https?:)?\/\//.test(item.path)
                ? item.path
                : `${IMAGE_HOST}${item.path}`;
              return (
                <button
                  key={`${item.path}-${itemIndex}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(itemIndex);
                  }}
                  aria-label={`Show image ${itemIndex + 1}`}
                  aria-current={index === itemIndex ? 'true' : undefined}
                  className={`h-[76px] w-[60px] shrink-0 overflow-hidden rounded-lg border-2  transition ${index === itemIndex ? 'border-white ring-2 ring-orange-400' : 'border-transparent opacity-75 hover:opacity-100'} cursor-pointer bg-white`}
                >
                  <img
                    src={thumbSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
