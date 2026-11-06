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
      <article className="space-y-6 pb-6 text-sm leading-6 text-gray-800">
        <header className="space-y-3">
          <h1 className="text-lg font-semibold">
            {t('userAgreement.documentTitle')}
          </h1>

          <p className="font-medium">
            {t('userAgreement.subtitle')}
          </p>

          <p>{t('userAgreement.lastUpdated')}</p>
        </header>

        <p>{t('userAgreement.introduction')}</p>

        {sections.map(({ number, paragraphs }) => (
          <section key={number} className="space-y-3">
            <h2 className="text-base font-semibold">
              {t(`userAgreement.section${number}.title`)}
            </h2>

            {Array.from({ length: paragraphs }, (_, index) => (
              <div key={index}>
                <p>
                  {t(`userAgreement.section${number}.p${index + 1}`)}
                </p>

                {number === 4 && index === 2 && (
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {[1, 2, 3, 4].map((item) => (
                      <li key={item}>
                        {t(`userAgreement.section4.item${item}`)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        ))}
      </article>
    </PageLayout>
  );
};

