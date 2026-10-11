import React from 'react';
import { useTranslation } from 'react-i18next';
import { formStyle } from '@app/styles/form';
import UploadPhoto from '@/shared/components/UploadPhoto/UploadPhoto';
import { Button } from '@/shared/ui/Button/Button';
import type { image as BookImage } from '@/types/entities/Book.d.ts';
import type { OfferFormData, OfferFormErrors } from '../types';
import { DealTypeSelector } from './DealTypeSelector';
import { GenreSelect } from './GenreSelect';
import { ConditionPriceFields } from './ConditionPriceFields';

interface OfferFormProps {
  formData: OfferFormData;
  errors: OfferFormErrors;
  onBlur: (field: keyof OfferFormErrors) => void;
  onChange: <K extends keyof OfferFormData>(
    field: K,
    value: OfferFormData[K]
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  existingImages: BookImage[];
  onPhotosChange: (photos: File[]) => void;
  onExistingImagesChange: (images: BookImage[]) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  offerId?: string;
}

export const OfferForm: React.FC<OfferFormProps> = ({
  formData,
  onChange,
  errors,
  onBlur,
  onSubmit,
  existingImages,
  onPhotosChange,
  onExistingImagesChange,
  isSubmitting,
  mode,
  offerId,
}) => {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={onSubmit}
      className="px-4 space-y-6 lg:space-y-8 sm:px-6 lg:px-8 xl:px-12"
    >
      {/* Book Title */}
      <div className={formStyle.container}>
        <label htmlFor="title" className={formStyle.title}>
          {t('sellBook.bookTitle')}
          {'*'}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          onBlur={() => onBlur('title')}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'title-error' : undefined}
          placeholder="Babel"
          className={formStyle.input}
          required
        />
        {errors.title && (
          <p id="title-error" className="mt-0,5 text-sm text-red-600">
            {t(errors.title)}
          </p>
        )}
      </div>

      {/* Author */}
      <div className={formStyle.container}>
        <label htmlFor="author" className={formStyle.title}>
          {t('sellBook.author')}
          {'*'}
        </label>
        <input
          id="author"
          name="author"
          type="text"
          value={formData.author}
          onChange={(e) => onChange('author', e.target.value)}
          onBlur={() => onBlur('author')}
          aria-invalid={Boolean(errors.author)}
          aria-describedby={errors.author ? 'author-error' : undefined}
          placeholder="Rebecca Kuang"
          className={formStyle.input}
          required
        />
        {errors.author && (
          <p id="author-error" className="mt-0.5 text-sm text-red-600">
            {t(errors.author)}
          </p>
        )}
      </div>

      {/* Upload Photo */}
      <UploadPhoto
        key={offerId || 'new'}
        onPhotosChange={onPhotosChange}
        initialExistingImages={existingImages}
        onExistingImagesChange={onExistingImagesChange}
      />

      {/* Genres Select */}
      <GenreSelect
        value={formData.genres}
        onChange={(genres) => onChange('genres', genres)}
      />

      {/* Deal Type Selection */}
      <DealTypeSelector
        value={formData.dealType}
        onChange={(dealType) => onChange('dealType', dealType)}
      />

      {/* Condition & Price */}
      <ConditionPriceFields
        condition={formData.condition}
        price={formData.price}
        onConditionChange={(condition) => onChange('condition', condition)}
        onPriceChange={(price) => onChange('price', price)}
      />

      {/* Description */}
      <div className="flex flex-col mb-5">
        <label htmlFor="desc" className="block mb-1 text-h4m">
          {t('sellBook.description')}
        </label>
        <textarea
          id="desc"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          onBlur={() => onBlur('description')}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? 'description-error' : undefined
          }
          placeholder={t('sellBook.descriptionPlaceholder')}
          rows={4}
          className="w-full px-[10px] py-[14px] rounded-lg lg:py-4
          border border-gray-400
          text-sm sm:text-base resize-none"
        />
        {errors.description && (
          <p id="description-error" className="mt-0.5 text-sm text-red-600">
            {t(errors.description)}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button type="submit" isLoading={isSubmitting} className="mb-[40px]">
          {isSubmitting
            ? t(`sellBook.${mode}.loading`)
            : t(`sellBook.${mode}.submit`)}
        </Button>
      </div>
    </form>
  );
};
