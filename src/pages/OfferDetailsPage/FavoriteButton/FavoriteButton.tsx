import clsx from 'clsx';
import { AddToFavoritesSvg } from '@/shared/ui/icons/AddToFavoritesSvg';

export const FavoriteButton = ({
  isFavorite,
  onToggle,
  disabled = false,
  favoritesCount,
}: {
  isFavorite: boolean;
  onToggle: () => void;
  disabled?: boolean;
  favoritesCount?: number;
}) => (
  <div className="flex items-center gap-2">
    {favoritesCount !== undefined && favoritesCount > 0 && (
      <p className="text-text-black">{favoritesCount}</p>
    )}
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      className={clsx('rounded p-1 transition-colors', {
        'opacity-50 cursor-default': disabled,
        'cursor-pointer hover:bg-aquamarine-100': !disabled,
      })}
    >
      <AddToFavoritesSvg
        className={clsx(
          'transition-colors',
          disabled ? 'cursor-default' : 'cursor-pointer',
          {
            'text-powder-600': isFavorite,
            'text-transparent': !isFavorite,
          }
        )}
      />
    </button>
  </div>
);
