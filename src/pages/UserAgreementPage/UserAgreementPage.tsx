
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';

export const UserAgreementPage = () => {
  const { t } = useTranslation();

  const sections = [
    { number: 1, paragraphs: 3 },
    { number: 2, paragraphs: 3 },
    { number: 3, paragraphs: 4 },
    { number: 4, paragraphs: 3 },
    { number: 5, paragraphs: 2 },
    { number: 6, paragraphs: 4 },
    { number: 7, paragraphs: 2 },
  ];

  return (
    <PageLayout title={t('userAgreement.title')}>
      <article className="w-full py-[10px] pb-6 text-left text-textBlack">
        {/* Назва документа */}
        <h2 className="mb-3 text-h3m">
          {t('userAgreement.documentTitle')}
        </h2>

        {/* Підзаголовок */}
        <p className="mb-3 text-paragraphm">
          {t('userAgreement.subtitle')}
        </p>

        {/* Дата оновлення */}
        <p className="mb-3 text-captionm">
          {t('userAgreement.lastUpdated')}
        </p>

        {/* Вступ */}
        <p className="mb-4 text-paragraphm">
          {t('userAgreement.introduction')}
        </p>

        {/* Усі розділи */}
        <div className="space-y-4">
          {sections.map(({ number, paragraphs }) => (
            <section key={number} className="space-y-2">
              <h3 className="text-h5m">
                {t(`userAgreement.section${number}.title`)}
              </h3>

              {Array.from({ length: paragraphs }, (_, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-paragraphm">
                    {t(`userAgreement.section${number}.p${index + 1}`)}
                  </p>

                  {number === 4 && index === 2 && (
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {[1, 2, 3, 4].map((item) => (
                        <li key={item} className="text-paragraphm">
                          {t(`userAgreement.section4.item${item}`)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>
      </article>
    </PageLayout>
  );
};
