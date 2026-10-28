import { useTranslation } from 'react-i18next';

export const BookTitle = ({
  title,
  authors,
}: {
  title: string;
  authors?: string[];
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-h3m lg:text-h2m text-text-black">{title}</h2>
      <p className="text-h6m lg:text-[16px] text-gray-800">
        {t('common.by')} {authors?.join(', ')}
      </p>
    </div>
  );
};
