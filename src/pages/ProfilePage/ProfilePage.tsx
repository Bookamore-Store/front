import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import announcementsIcon from '@/shared/ui/ProfileIcons/icon-announcements.png';
import ordersIcon from '@/shared/ui/ProfileIcons/icon-oreders.png';
import favoritesIcon from '@/shared/ui/ProfileIcons/icon-Bookmarks-.png';
import chatsIcon from '@/shared/ui/ProfileIcons/icon-Alert.png';
import privacyIcon from '@/shared/ui/ProfileIcons/icon-privacy_policy.png';
import agreementIcon from '@/shared/ui/ProfileIcons/icon-service_usage_policy.png';
import { ArrowRight } from '@/shared/ui/icons/Arrows';
import LogOut from '@/shared/components/LogOut/LogOut';
import { useGetCurrentUserQuery } from '@/app/store/api/UsersApi';
import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';
import { EditProfileSvg } from '@/shared/ui/icons/EditProfileSvg';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { data: user } = useGetCurrentUserQuery();
  const userInitials = user?.name
    ?.split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatarPath = user?.uploadedImage?.path ?? user?.socialAvatarUrl;
  const avatarUrl = avatarPath
    ? /^https?:\/\//i.test(avatarPath)
      ? avatarPath
      : `${IMAGE_HOST}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`
    : undefined;

  const menuItems = [
    {
      title: t('profileItems.announcements'),
      path: '/my-announcements',
      icon: <img src={announcementsIcon} alt="" className="w-5 h-5" />,
    },
    {
      title: t('profileItems.orders'),
      path: '/orders',
      icon: <img src={ordersIcon} alt="" className="w-5 h-5" />,
    },
    {
      title: t('profileItems.favorites'),
      path: '/favorites',
      icon: <img src={favoritesIcon} alt="" className="w-5 h-5" />,
    },
    {
      title: t('profileItems.chats'),
      path: '/chats',
      icon: <img src={chatsIcon} alt="" className="w-5 h-5" />,
    },
    {
      title: t('profileItems.privacyPolicy'),
      path: '/privacy-policy',
      icon: <img src={privacyIcon} alt="" className="w-5 h-5" />,
    },
    {
      title: t('profileItems.userAgreement'),
      path: '/user-agreement',
      icon: <img src={agreementIcon} alt="" className="w-5 h-5" />,
    },
  ];

  return (
    <PageLayout title={t('titles.profile')}>
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-center flex-row gap-[10px] mb-10 text-text-black">
          <div
            aria-label={user?.name}
            className="h-[86px] w-[86px] shrink-0 rounded-[50px] bg-[#A1D9D6] flex items-center justify-center text-h3m text-[#004261]"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name ?? ''}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              userInitials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-h3m">{user?.name}</h2>
            <p className="truncate text-em">{user?.email}</p>
          </div>
          <Link
            to="/edit-profile"
            className="shrink-0 p-1 rounded-[10px] hover:bg-sand-100/75 focus-within:bg-sand-100/75"
          >
            <EditProfileSvg />
          </Link>
        </div>

        <nav className="flex flex-col gap-5">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="
              flex justify-between items-center
              px-[16px] py-[13px]
              bg-sand-50
              border-[1px] border-solid border-grass-500 rounded-[20px]
              hover:bg-sand-100/85
            "
            >
              <div className="flex justify-start gap-4 text-text-black">
                <span className="">{item.icon}</span>
                <h2 className="text-h4m "> {item.title}</h2>
              </div>

              <ArrowRight />
            </Link>
          ))}
        </nav>
        <div className="mt-4 ml-4">
          <LogOut />
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
