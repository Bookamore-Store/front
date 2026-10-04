import { useNavigate } from 'react-router';
import clsx from 'clsx';
import type { OfferWithBook } from '@/types/entities/OfferWithBook';
import noImages from '@/assest/images/noImage.jpg';
import { AddToFavoritesSvg } from '@/shared/ui/icons/AddToFavoritesSvg';
import { useIsOfferOwner } from '@/shared/hooks/useIsOfferOwner';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

type BookCardProps = {
  offer: OfferWithBook;
  onContact: () => void;
  onFavorite: () => void;
  isOwner?: boolean;
};

export function BookCard({
  offer,
  onContact,
  onFavorite,
  isOwner: isOwnerProp,
}: BookCardProps) {
  const { book, price, type } = offer;
  const navigate = useNavigate();
  const isOwnerCalculated = useIsOfferOwner(offer);
  const isOwner = isOwnerProp ?? isOwnerCalculated;

  const handleCardClick = () => {
    navigate(`/offers/${offer.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation(); // Prevent card click when clicking buttons
    callback();
  };

  const imageSrc = book.images?.[0]?.path
    ? book.images[0].path.startsWith('http')
      ? book.images[0].path
      : `${IMAGE_HOST}${book.images[0].path}`
    : noImages;

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer 
      hover:shadow-md transition-shadow
                 flex gap-3 sm:gap-4 p-3 sm:p-4 
                 lg:flex-col lg:gap-0 lg:p-0 lg:h-full"
    >
      {/* Book image */}
      <div
        className="flex justify-center w-16 sm:w-20 h-20 sm:h-28 rounded flex-shrink-0
                      lg:w-full lg:h-48 xl:h-56 lg:rounded-t-lg lg:rounded-b-none"
      >
        <img
          src={imageSrc}
          alt={book.title}
          className="w-full h-full object-cover rounded lg:rounded-t-lg lg:rounded-b-none"
        />
      </div>

      {/* Book information and actions */}
      <div className="flex-1 flex flex-col min-w-0 lg:p-4 lg:gap-0">
        {/* Book details */}
        <div className="flex-1">
          <h3 className="font-bold text-base sm:text-lg mb-1 truncate lg:text-base lg:mb-2">
            {book.title}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-1 truncate lg:text-sm lg:mb-2">
            by {book.authors.join(', ')}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 lg:text-sm lg:mb-3">
            Condition: {book.condition}
          </p>

          {/* Price and Exchange */}
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3 lg:flex-col lg:items-start lg:gap-2 lg:mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
              <span className="text-xs text-gray-500 mb-1 lg:mb-0 lg:text-sm">
                Price:
              </span>
              <span className="font-bold text-base sm:text-lg lg:text-xl">
                {price} UAH
              </span>
            </div>
            {type === 'EXCHANGE' && (
              <button className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors lg:self-start">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <span className="hidden xs:inline">Exchange</span>
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-auto lg:gap-3">
          <button
            type="button"
            disabled={isOwner}
            onClick={(e) => {
              if (isOwner) return;
              handleButtonClick(e, onContact);
            }}
            className={clsx(
              'flex-1 bg-gray-800 text-white py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm lg:text-base transition-colors',
              isOwner
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-700 cursor-pointer'
            )}
          >
            Contact
          </button>
          <button
            type="button"
            disabled={isOwner}
            onClick={(e) => {
              if (isOwner) return;
              handleButtonClick(e, onFavorite);
            }}
            className={clsx(
              'p-2 sm:p-2.5 lg:p-3 border rounded-lg flex-shrink-0 transition-colors',
              isOwner
                ? 'opacity-50 cursor-not-allowed border-gray-200'
                : 'hover:bg-gray-50 cursor-pointer',
              offer.isFavorite
                ? 'border-powder-600 bg-powder-50'
                : 'border-gray-300'
            )}
            aria-label={
              offer.isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
          >
            <AddToFavoritesSvg
              className={clsx(
                'w-4 h-4 sm:w-5 sm:h-5 transition-colors',
                isOwner ? 'cursor-not-allowed' : 'cursor-pointer',
                {
                  'text-powder-600': offer.isFavorite,
                  'text-transparent': !offer.isFavorite,
                }
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
