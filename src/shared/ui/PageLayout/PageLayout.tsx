import { BottomNav } from '@shared/ui/BottomNav';
import HeaderTitle from '@/shared/ui/HeaderTitle';

export const PageLayout = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="min-h-screen">
    <HeaderTitle title={title} />

    <main className="mx-auto w-full lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
      {children}
      <div className="h-[65px]" />
    </main>

    <BottomNav />
  </div>
);
