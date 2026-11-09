
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';

type PolicySection = {
  heading: string;
  blocks: {
    text?: string;
    items?: string[];
  }[];
};

export const PrivacyPolicyPage = () => {
  const { t } = useTranslation();

  const sections = t('privacyPolicy.sections', {
    returnObjects: true,
  }) as PolicySection[];

  return (
    <PageLayout title={t('privacyPolicy.title')}>
      <article className="w-full py-[10px] pb-6 text-left text-textBlack">
        {/* Назва документа */}
        <h2 className="mb-3 text-h3m">
          {t('privacyPolicy.documentTitle')}
        </h2>

        {/* Дата оновлення */}
        <p className="mb-3 text-captionm">
          {t('privacyPolicy.lastUpdated')}
        </p>

        {/* Вступ */}
        <p className="mb-4 text-paragraphm">
          {t('privacyPolicy.introduction')}
        </p>

        {/* Усі розділи */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <section key={index} className="space-y-2">
              <h3 className="text-h5m">
                {section.heading}
              </h3>

              {section.blocks.map((block, blockIndex) => (
                <div key={blockIndex}>
                  {block.text && (
                    <p className="text-paragraphm">
                      {block.text}
                    </p>
                  )}

                  {block.items && (
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {block.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="text-paragraphm"
                        >
                          {item}
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
