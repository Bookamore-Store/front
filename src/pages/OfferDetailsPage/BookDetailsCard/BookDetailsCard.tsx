import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button/Button';
import { BookImageGallery } from './parts/BookImageGallery';
import { BookTitle } from './parts/BookTitle';
import { PriceBlock } from './parts/PriceBlock';

import { useIsOfferOwner } from '@/shared/hooks/useIsOfferOwner';

import type { OfferWithBook } from '@/types/entities/OfferWithBook';
import type { Book, image } from '@/types/entities/Book';

export const BookDetailsCard = ({
  offer,
  book,
  images,
  imgIndex,
  setImgIndex,
  isOwner: isOwnerProp,
}: {
  offer: OfferWithBook;
  book: Book;
  images: image[];
  imgIndex: number;
  setImgIndex: React.Dispatch<React.SetStateAction<number>>;
  isOwner?: boolean;
}) => {
  const { t } = useTranslation();
  const isOwnerCalculated = useIsOfferOwner(offer);
  const isOwner = isOwnerProp ?? isOwnerCalculated;

  return (
    <section className="px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="flex flex-col gap-4 items-center py-5 px-4 bg-powder-50 border-[1px] border-powder-300 rounded-[24px] w-full">
        <BookTitle title={book.title} authors={book.authors} />

        <BookImageGallery
          images={images}
          index={imgIndex}
          setIndex={setImgIndex}
          title={book.title}
          condition={book.condition}
        />

        <PriceBlock
          price={offer.price}
          showExchange={
            offer.type === 'SELL_EXCHANGE' || offer.type === 'EXCHANGE'
          }
        />

        <Button
          onClick={() => {
            if (isOwner) return;
            console.log('Contact');
          }}
          disabled={isOwner}
          className="max-w-[364px]"
        >
          {t('common.contact')}
        </Button>
      </div>
    </section>
  );
};
