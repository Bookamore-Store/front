import React from 'react';
import { useTranslation } from 'react-i18next';
//import Select from 'react-select';
//import makeAnimated from 'react-select/animated';
import { formStyle } from '@app/styles/form';
import { useGenres } from '@/shared/hooks/useGenres';
//import type { CategoryOption } from '../types';

interface GenreSelectProps {
  value: string[];
  onChange: (genres: string[]) => void;
  error?: string;
}

//const animatedComponents = makeAnimated();

export const GenreSelect: React.FC<GenreSelectProps> = ({
  value,
  onChange,
  error,
}) => {
  const { t } = useTranslation();
  const { options: categoryOptions, isLoading, isError } = useGenres();

  return (
    <div className={formStyle.container}>
      <h2 className={formStyle.title}>
        {t('sellBook.category')}
      </h2>
      <div
        role="group"
        aria-label={t('sellBook.genres')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'genres-error' : undefined}
        className="grid grid-cols-2 gap-x-4 gap-y-3"
      >
        {isLoading && <p>Loading genres...</p>}

        {isError && <p>Unable to load genres</p>}

        {!isLoading &&
          !isError &&
          categoryOptions.map((genre) => (
            <label
              key={genre.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                name="genres"
                value={genre.value}
                checked={value.includes(genre.value)}
                onChange={(e) => {
                  const updatedGenres = e.target.checked
                    ? [...value, genre.value]
                    : value.filter((item) => item !== genre.value);

                  onChange(updatedGenres);
                }}
                className="h-4 w-4 shrink-0 appearance-none rounded-[2px] border border-aquamarine-950 bg-white checked:bg-[url('/check.png')] checked:bg-center checked:bg-no-repeat cursor-pointer focus:outline-none focus:ring-0"
              />
              <span className="font-kyiv text-xs leading-5">
                {genre.label}
              </span>
            </label>
          ))}
      </div>
      {error && (
        <p id="genres-error" className="ml-3 mt-1 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
};
