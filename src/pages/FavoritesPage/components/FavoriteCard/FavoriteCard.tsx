import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useGetOfferWithBookByIdQuery } from '@/app/store/api/OffersApi';
import type { Offer } from '@/types/entities/Offer';
import noImages from '@/assest/images/noImage.jpg';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/shared/ui/Button/Button';
import { DeleteSvg } from '@/shared/ui/icons/DeleteSvg';
import { SynchronizeArrows } from '@/shared/ui/icons/Arrows';
import { useIsOfferOwner } from '@/shared/hooks/useIsOfferOwner';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

interface FavoriteCardProps {
  offer: Offer;
  onRemove: (offerId: string) => void;
  isRemoving?: boolean;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({
  offer,
  onRemove,
  isRemoving = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: offerWithBook, isLoading } = useGetOfferWithBookByIdQuery(
    offer.id
  );
  const isOwner = useIsOfferOwner(offerWithBook ?? offer);

  const book = offerWithBook?.book;
  const title = book?.title || offer.description || 'Book';
  const authors = book?.authors?.length ? book.authors.join(', ') : 'Unknown';
  const condition = book?.condition;
  const imagePath = book?.images?.[0]?.path;
  const imageSrc = imagePath
    ? imagePath.startsWith('http')
      ? imagePath
      : `${IMAGE_HOST}${imagePath}`
    : noImages;

  const handleImageCardClick = () => {
    navigate(`/offers/${offer.id}`);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(offer.id);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/offers/${offer.id}`);
  };

  return (
    <div className="relative flex max-w-[482px] lg:max-w-full items-center p-2.5 space-x-2.5 border rounded-xl border-aquamarine-500 bg-aquamarine-50">
      {/* Book Image */}
      <div className="w-[108px] h-[168px] flex-shrink-0">
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <img
            src={imageSrc}
            alt={title}
            onClick={handleImageCardClick}
            className="w-full h-full rounded-[10px] cursor-pointer object-cover"
          />
        )}
      </div>

      {/* Book Info */}
      <div className="w-full min-w-0 space-y-2 text-text-black">
        <h3 className="truncate pr-[24px] text-h3m">{title}</h3>

        <p className="text-paragraphm">{`${t('common.by')} ${authors}`}</p>

        {condition && (
          <p className="text-paragraphm">
            <span className="">{t('titles.condition')}:</span>{' '}
            <span className="">{t(`condition.${book.condition}`)}</span>
          </p>
        )}

        <div className="flex items-end justify-between">
          <div>
            <p className="text-paragraphm">{t('titles.price')}:</p>
            <p className="text-paragraphm font-bold">{offer.price} UAH</p>
          </div>

          {(offer.type === 'SELL_EXCHANGE' || offer.type === 'EXCHANGE') && (
            <div
              className="
                flex items-center gap-[6px]
                px-1 py-0.5 rounded-[12px]
                text-[12px] md:text-[14px] lg:text-base
                text-gray-600 bg-aquamarine-50"
            >
              <SynchronizeArrows />
              {t('common.exchange')}
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={handleRemoveClick}
          disabled={isRemoving}
          className="absolute top-0 right-0 p-2 lg:top-1 lg:right-1 lg:p-1 rounded-[10px] cursor-pointer hover:text-delete hover:bg-red-50 focus:text-delete transition-colors outline-delete"
        >
          <DeleteSvg />
        </button>

        {/* Contact Button */}
        <Button
          type="button"
          onClick={(e) => {
            if (isOwner) return;
            handleContactClick(e);
          }}
          disabled={isOwner}
          className="mx-auto block"
        >
          {t('common.contact')}
        </Button>
      </div>
    </div>
  );
};
