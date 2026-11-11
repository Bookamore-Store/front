import React from 'react';
import { useTranslation } from 'react-i18next';
import { formStyle } from '@app/styles/form';
import UploadPhoto, {
  type OrderedPhoto,
} from '@/shared/components/UploadPhoto/UploadPhoto';
import { Button } from '@/shared/ui/Button/Button';
import { AlertSvg } from '@/shared/ui/icons/AlertSvg';
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
  onImagesOrderChange: (images: OrderedPhoto[]) => void;
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
  onImagesOrderChange,
  isSubmitting,
  mode,
  offerId,
}) => {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="px-4 space-y-6 lg:space-y-8 sm:px-6 lg:px-8 xl:px-12"
    >
      {/* Book Title */}
      <div className={formStyle.container}>
        <label htmlFor="title" className={formStyle.title}>
          {t('sellBook.bookTitle')}
          {'*'}
        </label>
        <div className="group relative">
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
            className={`${formStyle.input} ${errors.title ? 'pr-10' : ''}`}
            required
          />
          {errors.title && (
            <AlertSvg className="absolute right-2.5 top-1/2 -translate-y-1/2" />
          )}
        </div>
        {errors.title && (
          <p id="title-error" className="ml-3 mt-1 text-sm text-error">
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
        <div className="group relative">
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
            className={`${formStyle.input} ${errors.author ? 'pr-10' : ''}`}
            required
          />
          {errors.author && (
            <AlertSvg className="absolute right-2.5 top-1/2 -translate-y-1/2" />
          )}
        </div>
        {errors.author && (
          <p id="author-error" className="ml-3 mt-1 text-sm text-error">
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
        onImagesOrderChange={onImagesOrderChange}
      />

      {/* Genres Select */}
      <GenreSelect
        value={formData.genres}
        onChange={(genres) => onChange('genres', genres)}
        error={errors.genres ? t(errors.genres) : undefined}
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
        priceError={errors.price ? t(errors.price) : undefined}
        onPriceBlur={() => onBlur('price')}
        onConditionChange={(condition) => onChange('condition', condition)}
        onPriceChange={(price) => onChange('price', price)}
      />

      {/* Description */}
      <div className="flex flex-col mb-5">
        <label htmlFor="desc" className="block mb-1 text-h4m">
          {t('sellBook.description')}
          {'*'}
        </label>
        <div className="relative">
          <textarea
            id="desc"
            value={formData.description}
            required
            onChange={(e) => onChange('description', e.target.value)}
            onBlur={() => onBlur('description')}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? 'description-error' : undefined
            }
            placeholder={t('sellBook.descriptionPlaceholder')}
            rows={4}
            className={`w-full rounded-lg border border-gray-400 px-[10px] py-[14px] text-sm resize-none lg:py-4 sm:text-base ${
              errors.description ? 'pr-10' : ''
            }`}
          />
          {errors.description && (
            <AlertSvg className="absolute right-2.5 top-3" />
          )}
        </div>
        {errors.description && (
          <p id="description-error" className="ml-3 mt-1 text-sm text-error">
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
