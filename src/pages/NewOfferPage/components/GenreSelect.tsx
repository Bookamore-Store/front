import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { formStyle } from '@app/styles/form';
import { useGenres } from '@/shared/hooks/useGenres';
import type { CategoryOption } from '../types';

interface GenreSelectProps {
  value: string[];
  onChange: (genres: string[]) => void;
  error?: string;
}

const animatedComponents = makeAnimated();

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
        {t('sellBook.genres')}
        {'*'}
      </h2>
      <Select<CategoryOption, true>
        className="
          w-full
          text-gray-500
          text-sm
          sm:text-base
          font-kyiv
        "
        id="genres"
        options={categoryOptions}
        isLoading={isLoading}
        isDisabled={isLoading || isError}
        noOptionsMessage={() => isError ? 'Unable to load genres' : 'No genres available'}
        closeMenuOnSelect={false}
        components={animatedComponents}
        isMulti
        placeholder={t('sellBook.genresPlaceholder')}
        name="genres"
        classNamePrefix="select"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'genres-error' : undefined}
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: error
              ? '#E51C29'
              : state.isFocused
                ? '#9CA3AF'
                : base.borderColor,
            boxShadow: error
              ? '0 0 0 1px #E51C29'
              : state.isFocused
                ? '0 0 0 1px #9CA3AF'
                : base.boxShadow,
            '&:hover': {
              borderColor: error ? '#E51C29' : '#9CA3AF',
            },
          }),
        }}
        onChange={(selectedOptions) => {
          onChange(selectedOptions.map((opt) => opt.value));
        }}
        value={categoryOptions.filter((genre) => value.includes(genre.value))}
      />
      {error && (
        <p id="genres-error" className="ml-3 mt-1 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
};
