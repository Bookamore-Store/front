import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useGenres } from '@/shared/hooks/useGenres';

interface CategoryButtonProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

function CategoryButton({
  label,
  isActive = false,
  onClick,
}: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 sm:px-4 py-1.5 sm:py-2 rounded-[8px] text-sm sm:text-base lg:text-lg font-medium whitespace-nowrap border outline-grass-500 border-grass-500 focus:bg-grass-100 transition-colors cursor-pointer
        ${
          isActive
            ? 'bg-grass-500 text-white focus:text-text-black'
            : 'text-text-black hover:bg-grass-100'
        }
      `}
    >
      {label}
    </button>
  );
}

export function Categories() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { options, isLoading, isError } = useGenres();

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      // Navigate to home or all offers page
      navigate('/');
    } else {
      // Navigate to genre results page
      navigate(`/genres/${categoryId}`);
    }
  };

  return (
    <section className="bg-white w-full border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        <h3 className="py-2 sm:py-2.5 lg:py-3 text-lg sm:text-xl lg:text-2xl font-bold text-text-black">
          {t('titles.categories')}
        </h3>

        {/* Scrollable categories */}
        <div className="flex gap-2 py-2 sm:py-2.5 lg:py-3 sm:gap-3 lg:gap-4 overflow-x-auto scrollbar-custom">
          {[{ value: 'all', label: t('categories.all') }, ...options].map(({ value: category, label }) => (
            <CategoryButton
              key={category}
              label={label}
              isActive={activeCategory === category}
              onClick={() => {
                setActiveCategory(category);
                handleCategoryClick(category);
              }}
            />
          ))}
          {isLoading && <span className="text-sm text-gray-500">Loading genres...</span>}
          {isError && <span className="text-sm text-red-600">Unable to load genres</span>}
        </div>
      </div>
    </section>
  );
}
