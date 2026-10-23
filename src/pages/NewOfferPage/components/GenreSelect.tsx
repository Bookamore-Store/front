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
}

const animatedComponents = makeAnimated();

export const GenreSelect: React.FC<GenreSelectProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const { options: categoryOptions, isLoading, isError } = useGenres();

  return (
    <div className={formStyle.container}>
      <h2 className={formStyle.title}>{t('sellBook.genres')}</h2>
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
        onChange={(selectedOptions) => {
          onChange(selectedOptions.map((opt) => opt.value));
        }}
        value={categoryOptions.filter((genre) => value.includes(genre.value))}
      />
    </div>
  );
};
