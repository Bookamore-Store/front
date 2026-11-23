import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/app/store/hooks';
import {
  useChangePasswordMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  UsersApi,
} from '@/app/store/api/UsersApi';
import {
  useDeleteImageByIdMutation,
  useUploadImageMutation,
} from '@/app/store/api/ImagesApi';
import { updateUser } from '@/app/store/slices/authSlice';
import { PasswordValidator } from '@/modules/auth/ui/PasswordValidator';
import {
  convertHeicToJpeg,
  getImageDimensions,
  getPhotoFormatFromContent,
  getPhotoFormatFromExtension,
  isHeicPhoto,
} from '@/shared/helpers/imageValidation';
import { validators } from '@/shared/helpers/validators';
import { Button } from '@/shared/ui/Button/Button';
import { FormField } from '@/shared/ui/FormField';
import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';
import { Spinner } from '@/shared/ui/Spinner';
import { AlertSvg } from '@/shared/ui/icons/AlertSvg';
import { AddSvg } from '@/shared/ui/icons/AddSvg';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

const getApiErrorMessage = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('data' in error)) {
    return undefined;
  }

  const data = error.data;
  if (typeof data !== 'object' || data === null || !('message' in data)) {
    return undefined;
  }

  return typeof data.message === 'string' ? data.message : undefined;
};

const isNewPasswordSameAsCurrentError = (message: string): boolean =>
  /new password.*(same|different).*(current|old)|new password is the same as the current one/i.test(
    message
  );

const isCurrentPasswordError = (message: string): boolean =>
  /(current|old)\s*password|password\s+(is\s+)?(incorrect|invalid)/i.test(
    message
  );

const getAvatarUrl = (path?: string) => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${IMAGE_HOST}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const EditProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [uploadImage, { isLoading: isUploadingImage }] =
    useUploadImageMutation();
  const [deleteImageById, { isLoading: isDeletingImage }] =
    useDeleteImageByIdMutation();

  const [username, setUsername] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>();
  const [avatarError, setAvatarError] = useState('');
  const [isValidatingAvatar, setIsValidatingAvatar] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const userName = user?.name;

  useEffect(() => {
    if (userName !== undefined) setUsername(userName);
  }, [userName]);

  useEffect(() => {
    if (!avatarPreview) return;
    return () => {
      URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const isSubmitting =
    isUpdatingProfile ||
    isChangingPassword ||
    isUploadingImage ||
    isDeletingImage;
  const normalizedUsername = username.trim();
  const isUsernameChanged = normalizedUsername !== user?.name;
  const hasChanges =
    isUsernameChanged || Boolean(avatarFile) || Boolean(newPassword);
  const avatarPath = user?.uploadedImage?.path ?? user?.socialAvatarUrl;
  const avatarUrl = avatarPreview ?? getAvatarUrl(avatarPath);
  const initials =
    normalizedUsername
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setAvatarError('');
    setFormError('');
    setIsValidatingAvatar(true);

    try {
      if (file.size < 5 * 1024) {
        setAvatarError(t('editProfile.avatarTooSmall'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError(t('editProfile.avatarTooLarge'));
        return;
      }

      const extensionFormat = getPhotoFormatFromExtension(file.name);
      if (!extensionFormat) {
        setAvatarError(t('sellBook.photoUnsupportedFormat'));
        return;
      }

      let contentFormat;
      try {
        contentFormat = await getPhotoFormatFromContent(file);
      } catch (error) {
        console.error('Failed to validate avatar file contents.', error);
        setAvatarError(t('sellBook.photoUnsupportedFormat'));
        return;
      }

      if (contentFormat !== extensionFormat) {
        setAvatarError(t('sellBook.photoUnsupportedFormat'));
        return;
      }

      const previewBlob = isHeicPhoto(file)
        ? await convertHeicToJpeg(file)
        : file;
      const { width, height } = await getImageDimensions(previewBlob);
      if (width < 400 || height < 400) {
        setAvatarError(t('editProfile.avatarDimensionsTooSmall'));
        return;
      }

      setAvatarPreview(URL.createObjectURL(previewBlob));
      setAvatarFile(file);
    } catch (error) {
      console.error('Failed to validate avatar image.', error);
      setAvatarError(t('editProfile.avatarInvalid'));
    } finally {
      setIsValidatingAvatar(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUsernameError('');
    setCurrentPasswordError('');
    setPasswordError('');
    setFormError('');

    if (!user || isSubmitting || isValidatingAvatar || avatarError) {
      return;
    }

    if (!normalizedUsername) {
      setUsernameError(t('validation.usernameRequired'));
      return;
    }
    if (normalizedUsername.length < 2 || normalizedUsername.length > 100) {
      setUsernameError(t('validation.usernameLength'));
      return;
    }
    if (newPassword && !validators.passwordPattern(newPassword)) {
      setPasswordError(t('validation.passwordRequirements'));
      return;
    }
    if (!hasChanges) return;

    try {
      if (isUsernameChanged) {
        await updateProfile({ name: normalizedUsername }).unwrap();
        dispatch(updateUser({ name: normalizedUsername }));
        dispatch(
          UsersApi.util.updateQueryData(
            'getCurrentUser',
            undefined,
            (draft) => {
              draft.name = normalizedUsername;
            }
          )
        );
      }

      if (avatarFile) {
        if (user.uploadedImage?.id) {
          await deleteImageById(user.uploadedImage.id).unwrap();
          dispatch(updateUser({ uploadedImage: undefined }));
          dispatch(
            UsersApi.util.updateQueryData(
              'getCurrentUser',
              undefined,
              (draft) => {
                delete draft.uploadedImage;
              }
            )
          );
        }

        const uploadedImage = await uploadImage({
          file: avatarFile,
          entityType: 'USER',
        }).unwrap();
        const uploadedImageData = {
          id: uploadedImage.id,
          path: uploadedImage.path,
        };
        dispatch(updateUser({ uploadedImage: uploadedImageData }));
        dispatch(
          UsersApi.util.updateQueryData(
            'getCurrentUser',
            undefined,
            (draft) => {
              draft.uploadedImage = uploadedImageData;
            }
          )
        );
      }

      if (newPassword) {
        try {
          await changePassword({ currentPassword, newPassword }).unwrap();
        } catch (error: unknown) {
          const message = getApiErrorMessage(error);
          if (message && isNewPasswordSameAsCurrentError(message)) {
            setPasswordError(t('validation.newPasswordSameAsCurrent'));
            return;
          }
          if (message && isCurrentPasswordError(message)) {
            setCurrentPasswordError(t('validation.currentPasswordIncorrect'));
            return;
          }
          throw error;
        }
      }

      navigate('/profile');
    } catch (error: unknown) {
      setFormError(getApiErrorMessage(error) ?? t('editProfile.saveError'));
    }
  };

  return (
    <PageLayout title={t('titles.editProfile')}>
      <div className="mx-auto w-full max-w-[416px]">
        {isUserLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            {t('editProfile.loading')}
          </p>
        ) : userError || !user ? (
          <p className="py-8 text-center text-sm text-error" role="alert">
            {t('editProfile.loadError')}
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5 flex justify-center">
              <div className="relative h-[108px] w-[108px]">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#A1D9D6] text-2xl text-[#004261]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                {(isUploadingImage || isValidatingAvatar) && (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70"
                    role="status"
                    aria-label={
                      isUploadingImage
                        ? t('editProfile.avatarUploading')
                        : t('sellBook.photoPreviewLoading')
                    }
                  >
                    <Spinner size="md" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heif,image/heic"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  disabled={isSubmitting || isValidatingAvatar}
                  aria-label={t('editProfile.changeAvatar')}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || isValidatingAvatar}
                  aria-label={t('editProfile.changeAvatar')}
                  className="absolute bottom-0 right-0 bg-white rounded-full cursor-pointer"
                >
                  <AddSvg />
                </button>
              </div>
            </div>
            {avatarError && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2.5 text-sm text-error border rounded-xl">
                <p role="alert">{avatarError}</p>
                <AlertSvg className="min-w-[24px] min-h-[24px]" />
              </div>
            )}

            <div className="mb-5 px-3">
              <p className="mb-1 text-sm text-text-black">{t('auth.email')}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>

            <FormField
              id="username"
              label={t('editProfile.username')}
              name="username"
              placeholder={t('editProfile.username')}
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setUsernameError('');
                setFormError('');
              }}
              error={usernameError}
              autoComplete="username"
              disabled={isSubmitting}
              required
            />

            <FormField
              id="currentPassword"
              label={t('auth.currentPassword')}
              type="password"
              name="currentPassword"
              placeholder={t('auth.currentPassword')}
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setCurrentPasswordError('');
                setFormError('');
              }}
              error={currentPasswordError}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            {!currentPasswordError && (
              <p className="-mt-3 mb-4 ml-3 text-xs text-gray-500">
                {t('editProfile.currentPasswordHint')}
              </p>
            )}

            <FormField
              id="newPassword"
              label={t('auth.newPassword')}
              type="password"
              name="newPassword"
              placeholder={t('auth.newPassword')}
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setPasswordError('');
                setFormError('');
              }}
              error={passwordError}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            {newPassword && !passwordError && (
              <div className="-mt-2 mb-4">
                <PasswordValidator password={newPassword} />
              </div>
            )}

            {formError && (
              <p className="mb-4 text-sm text-error" role="alert">
                {formError}
              </p>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={
                !hasChanges || isValidatingAvatar || Boolean(avatarError)
              }
              className="max-w-none rounded-xl py-3"
            >
              {isSubmitting
                ? t('editProfile.saving')
                : t('editProfile.saveChanges')}
            </Button>
          </form>
        )}
      </div>
    </PageLayout>
  );
};
