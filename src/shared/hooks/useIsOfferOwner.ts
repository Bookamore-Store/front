import { useAppSelector } from '@/app/store/hooks';
import { selectUser, selectToken } from '@/app/store/slices/authSlice';
import { useGetCurrentUserQuery } from '@/app/store/api/UsersApi';

export type OfferOwnerCheckable = {
  sellerId?: string | number;
  seller?: {
    id?: string | number;
  };
};

export const isOfferOwner = (
  offer?: OfferOwnerCheckable | null,
  userId?: string | number | null
): boolean => {
  if (!offer || userId === undefined || userId === null) return false;
  const ownerId = offer.seller?.id ?? offer.sellerId;
  if (ownerId === undefined || ownerId === null) return false;
  return String(ownerId) === String(userId);
};

export const useCurrentUserId = (): string | null => {
  const authUser = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);

  const { data: apiUser } = useGetCurrentUserQuery(undefined, {
    skip: !token || Boolean(authUser?.id),
  });

  const userId = authUser?.id ?? apiUser?.id;
  return userId !== undefined && userId !== null ? String(userId) : null;
};

export const useIsOfferOwner = (
  offer?: OfferOwnerCheckable | null
): boolean => {
  const currentUserId = useCurrentUserId();
  return isOfferOwner(offer, currentUserId);
};
