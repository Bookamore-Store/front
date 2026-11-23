import { useTranslation } from 'react-i18next';
import { useGetUserByUuidQuery } from '@/app/store/api/UsersApi';
import { UserAvatar } from '@/shared/ui/UserAvatar/UserAvatar';
import type { Seller } from '@/types/entities/OfferWithBook';

export const SellerBlock = ({ seller }: { seller: Seller }) => {
  const { t } = useTranslation();
  const { data: sellerProfile } = useGetUserByUuidQuery(String(seller.id), {
    skip: !seller.id,
  });
  const avatarPath =
    sellerProfile?.uploadedImage?.path ?? sellerProfile?.socialAvatarUrl;
  const imageHost = import.meta.env.VITE_IMAGE_HOST || '';
  const avatarUrl = avatarPath
    ? /^https?:\/\//i.test(avatarPath)
      ? avatarPath
      : `${imageHost}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`
    : null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
      <h2 className="mb-1 text-base lg:text-lg font-medium text-text-black">
        {t('bookDetails.seller')}
      </h2>

      <div className="flex items-center gap-2">
        <UserAvatar
          name={seller.name}
          avatarUrl={avatarUrl}
          className="h-10 w-10 lg:h-12 lg:w-12"
        />
        <p className="text-sm lg:text-base text-text-black capitalize">
          {seller.name}
        </p>
      </div>
    </section>
  );
};
