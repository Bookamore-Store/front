import { useNavigate, useLocation } from 'react-router';
import { useAppSelector } from '@/app/store/hooks';
import { selectIsAuthenticated } from '@/app/store/slices/authSlice';
import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from '@/app/store/api/FavoritesApi';

export const useFavoriteToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [addToFavorites, { isLoading: isAdding }] = useAddToFavoritesMutation();
  const [removeFromFavorites, { isLoading: isRemoving }] =
    useRemoveFromFavoritesMutation();

  const toggleFavorite = async (
    offerId: string,
    currentIsFavorite: boolean,
    isOwner?: boolean
  ): Promise<boolean> => {
    if (isOwner) {
      return currentIsFavorite;
    }

    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: location } });
      return false;
    }

    try {
      if (currentIsFavorite) {
        await removeFromFavorites(offerId).unwrap();
        return false;
      } else {
        await addToFavorites(offerId).unwrap();
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return currentIsFavorite;
    }
  };

  return {
    toggleFavorite,
    isLoading: isAdding || isRemoving,
  };
};
