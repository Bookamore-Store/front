
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';
import { LanguageSwitch } from '@/shared/components/LanguageSwitch/LanguageSwitch';

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
     <div className="flex justify-end py-2">
          <LanguageSwitch />
        </div>
      <article className="w-full py-[10px] text-left text-slate-900">

        {/* Назва документа */}
        <h2 className="mb-3 text-[14px] font-semibold leading-[20px] sm:text-base">
          {t('privacyPolicy.documentTitle')}
        </h2>

        {/* Дата оновлення */}
        <p className="mb-3 text-[12px] leading-[18px] sm:text-sm">
          {t('privacyPolicy.lastUpdated')}
        </p>

        {/* Вступ */}
        <p className="mb-4 text-[13px] leading-[19px] sm:text-sm sm:leading-relaxed">
          {t('privacyPolicy.introduction')}
        </p>

        {/* Усі розділи */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <section key={index} className="space-y-2">

              <h3 className="text-[13px] font-semibold leading-[19px] sm:text-sm">
                {section.heading}
              </h3>

              {section.blocks.map((block, blockIndex) => (
                <div key={blockIndex}>
                  {block.text && (
                    <p className="text-[13px] leading-[19px] sm:text-sm sm:leading-relaxed">
                      {block.text}
                    </p>
                  )}

                  {block.items && (
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {block.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="text-[13px] leading-[19px] sm:text-sm sm:leading-relaxed"
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
