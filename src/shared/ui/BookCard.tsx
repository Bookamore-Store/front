import { useNavigate, useLocation } from 'react-router';
// import clsx from 'clsx';
import type { OfferWithBook } from '@/types/entities/OfferWithBook';
import noImages from '@/assest/images/noImage.jpg';
import { useIsOfferOwner } from '@/shared/hooks/useIsOfferOwner';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/app/store/slices/authSlice';
import type { Conversation } from '@/types/entities/Chat';
import { useGetConversationsQuery } from '@/app/store/api/ChatsApi';
import { useState, useEffect } from 'react';
import { ContactSellerModal } from '@/shared/components/ContactSellerModal/ContactSellerModal';
import { Button } from '@/shared/ui/Button/Button';
import { useTranslation } from 'react-i18next';
import { SynchronizeArrows } from './icons/Arrows';
import { FavoriteButton } from '@/shared/components/FavoriteButton';
import { useFavoriteToggle } from '@/shared/hooks/useFavoriteToggle';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

type BookCardProps = {
  offer: OfferWithBook;
  onFavoriteToggle?: (offerId: string, nextIsFavorite: boolean) => void;
};

export function BookCard({ offer, onFavoriteToggle }: BookCardProps) {
  const { book, price, type } = offer;
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOwner = useIsOfferOwner(offer);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { t } = useTranslation();
  const { toggleFavorite, isLoading: isTogglingFavorite } = useFavoriteToggle();

  const [isFavorite, setIsFavorite] = useState(Boolean(offer.isFavorite));
  const [favoritesCount, setFavoritesCount] = useState(offer.favoritesCount);

  useEffect(() => {
    setIsFavorite(Boolean(offer.isFavorite));
    setFavoritesCount(offer.favoritesCount);
  }, [offer.isFavorite, offer.favoritesCount]);

  const { data: conversationsData } = useGetConversationsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const handleImageClick = () => {
    navigate(`/offers/${offer.id}`);
  };

  const handleContactClick = () => {
    if (isOwner) return;

    if (!isAuthenticated) {
      navigate('/sign-in');
      return;
    }

    const conversations: Conversation[] = Array.isArray(conversationsData)
      ? conversationsData
      : (conversationsData?.content ?? []);

    const existingConv = conversations.find((c) => c.offer?.id === offer.id);

    if (existingConv) {
      navigate(`/chats/${existingConv.id}`);
      return;
    }

    setIsContactModalOpen(true);
  };

  const imageSrc = book.images?.[0]?.path
    ? book.images[0].path.startsWith('http')
      ? book.images[0].path
      : `${IMAGE_HOST}${book.images[0].path}`
    : noImages;

  return (
    <>
      <div className="relative flex w-full min-w-[345px] max-w-[482px] gap-2.5 p-2.5 border border-aquamarine-500 rounded-[12px] text-text-black ">
        <img
          src={imageSrc}
          alt={book.title}
          onClick={handleImageClick}
          className="w-[108px] h-[168px] min-w-[108px] min-h-[168px] rounded-[10px] object-cover cursor-pointer"
        />
        <div className="w-full min-w-0 space-y-2">
          <h3 className="pr-9 text-h3m truncate">{book.title}</h3>
          <p className="max-w-full text-paragraphm truncate">
            {t('common.by')} {book.authors}
          </p>
          <p className="text-paragraphm capitalize">
            {t('titles.condition')}: {t(`condition.${book.condition}`)}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-paragraphm">{t('titles.price')}:</p>
              <p className="text-paragraphm font-bold">{price} UAH</p>
            </div>

            {(type === 'SELL_EXCHANGE' || type === 'EXCHANGE') && (
              <div className="flex items-center gap-[6px] px-1 py-0.5 rounded-[12px] text-[12px] md:text-[14px] lg:text-base text-gray-600 bg-aquamarine-50">
                <SynchronizeArrows />
                {t('common.exchange')}
              </div>
            )}
          </div>

          <Button disabled={isOwner} onClick={handleContactClick}>
            {t('common.contact')}
          </Button>
        </div>
        <FavoriteButton
          isFavorite={isFavorite}
          favoritesCount={favoritesCount}
          disabled={isTogglingFavorite || isOwner}
          onToggle={async () => {
            if (isOwner) return;

            if (!isAuthenticated) {
              navigate('/sign-in', { state: { from: location } });
              return;
            }

            const current = isFavorite;
            const next = !current;
            const nextCount =
              typeof favoritesCount === 'number'
                ? next
                  ? favoritesCount + 1
                  : Math.max(0, favoritesCount - 1)
                : favoritesCount;

            setIsFavorite(next);
            setFavoritesCount(nextCount);
            onFavoriteToggle?.(offer.id, next);

            const result = await toggleFavorite(offer.id, current, isOwner);
            if (result !== next) {
              setIsFavorite(result);
              setFavoritesCount(offer.favoritesCount);
              onFavoriteToggle?.(offer.id, result);
            }
          }}
          className="absolute top-2 right-2"
        />
      </div>
      <ContactSellerModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        offerId={offer.id}
        book={book}
        price={price}
        sellerName={offer.seller?.name || 'Seller'}
      />
    </>
  );
}
