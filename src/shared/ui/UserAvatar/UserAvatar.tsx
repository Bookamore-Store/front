import { useState } from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

const getInitials = (name: string): string => {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
};

export const UserAvatar = ({
  name,
  avatarUrl,
  className = 'h-12 w-12',
}: UserAvatarProps) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const initials = getInitials(name);
  const showImage = Boolean(avatarUrl && failedUrl !== avatarUrl);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-aquamarine-100 ${className}`}
    >
      {showImage ? (
        <img
          src={avatarUrl!}
          alt={name}
          onError={() => setFailedUrl(avatarUrl!)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-label={name}
          className="text-[10px] font-medium text-aquamarine-700"
        >
          {initials}
        </span>
      )}
    </div>
  );
};
