import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BookCondition } from '@/types/entities/Book.d.ts';
import { AlertSvg } from '@/shared/ui/icons/AlertSvg';

interface ConditionPriceFieldsProps {
  condition: BookCondition;
  price: string;
  priceError?: string;
  onPriceBlur: () => void;
  onConditionChange: (value: BookCondition) => void;
  onPriceChange: (value: string) => void;
}

export const ConditionPriceFields: React.FC<ConditionPriceFieldsProps> = ({
  condition,
  price,
  priceError,
  onPriceBlur,
  onConditionChange,
  onPriceChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row justify-between">
      <div className="w-[164px] flex flex-col gap-1">
        <label
          htmlFor="condition"
          className="text-h6m text-aquamarine-950 py-[4px] px-[12px]"
        >
          {t('titles.condition')}
          {'*'}
        </label>
        <select
          name="condition"
          id="condition"
          value={condition}
          onChange={(e) => onConditionChange(e.target.value as BookCondition)}
          className="min-w-[163px] h-[44px] text-h6m
          border-[0.4px] border-gray-400 border-solid rounded-xl
          px-[10px] py-[12px]
          bg-no-repeat bg-[url('/down.png')]
          bg-[right_10px_center]
          focus:outline-none focus:ring-0 appearance-none"
        >
          <option value="NEW">{t('condition.NEW')}</option>
          <option value="AS_NEW">{t('condition.AS_NEW')}</option>
          <option value="USED">{t('condition.USED')}</option>
        </select>
      </div>

      <div className="w-[164px] flex flex-col gap-1">
        <label
          htmlFor="price"
          className="text-h6m text-aquamarine-950 py-[4px] px-[12px]"
        >
          {`${t('titles.price')}, UAH`}
          {'*'}
        </label>

        <div className="relative">
          <input
            type="number"
            id="price"
            name="price"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            onBlur={onPriceBlur}
            aria-invalid={Boolean(priceError)}
            aria-describedby={priceError ? 'price-error' : undefined}
            placeholder="300"
            className={`max-w-full h-[44px] text-h6m text-black
            border-[0.4px] border-gray-400 border-solid rounded-xl
            px-[10px] py-[12px] pr-10
            focus:outline-none focus:ring-0 ${
              priceError ? 'border-error' : ''
            }`}
            required
            min="0"
            step="1"
          />
          {priceError && (
            <AlertSvg className="absolute right-2.5 top-1/2 -translate-y-1/2" />
          )}
        </div>
        {priceError && (
          <p id="price-error" className="ml-3 mt-1 text-sm text-error">
            {priceError}
          </p>
        )}
      </div>
    </div>
  );
};
