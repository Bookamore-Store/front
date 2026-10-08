import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { Button } from '@/shared/ui/Button/Button';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { BottomNav } from '@/shared/ui/BottomNav';
import { FormField } from '@/shared/ui/FormField';
import { AlertSvg } from '@/shared/ui/icons/AlertSvg';
import { validators } from '@/shared/helpers/validators';
import { useTranslation } from 'react-i18next';
import { PasswordValidator } from '@/modules/auth/ui/PasswordValidator';
import { useResetPasswordMutation } from '@/app/store/api/AuthApi';

interface ValidationError {
  password?: string;
  confirmPassword?: string;
  form?: string;
}

interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

interface UpdatePasswordLocationState {
  email?: string;
  code?: string;
}

const UpdatePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { email, code } =
    (location.state as UpdatePasswordLocationState | null) || {};

  const [formData, setFormData] = useState<UpdatePasswordFormData>({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<ValidationError>({});
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, code, navigate]);

  const clearFieldError = (field: keyof UpdatePasswordFormData) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      form: undefined,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name as keyof UpdatePasswordFormData;
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    clearFieldError(field);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};

    if (!formData.password) {
      newErrors.password = 'validation.passwordRequired';
    } else if (!validators.password(formData.password)) {
      newErrors.password = 'validation.passwordMinLength';
    } else if (!validators.passwordPattern(formData.password)) {
      newErrors.password = 'validation.passwordRequirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'validation.confirmPassword';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'validation.passwordsDoNotMatch';
    }

    setErrors(newErrors);

    return !Object.keys(newErrors).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isLoading) return;
    if (!email || !code) {
      navigate('/forgot-password', { replace: true });
      return;
    }

    try {
      await resetPassword({
        email,
        code,
        password: formData.password,
      }).unwrap();

      navigate('/sign-in', {
        state: {
          email,
          successMessage: 'auth.passwordResetSuccess',
        },
        replace: true,
      });
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number | string;
        data?: { message?: string };
      };

      if (apiErr?.status === 400) {
        const msg = apiErr.data?.message || '';
        if (/invalid or expired/i.test(msg)) {
          setErrors((prev) => ({
            ...prev,
            form: 'validation.invalidResetCode',
          }));
        } else if (/password/i.test(msg)) {
          setErrors((prev) => ({
            ...prev,
            password: 'validation.passwordRequirements',
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            form: msg || 'validation.resetPasswordError',
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          form: apiErr?.data?.message || 'validation.resetPasswordError',
        }));
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white">
      <AuthHeader tittle={t('auth.updatePassword')} />

      <div className="w-full max-w-sm px-6 space-y-9">
        <p className="text-center text-paragraphm text-text-black">
          {t('auth.updatePasswordDescription')}
        </p>

        <form className="w-full" onSubmit={handleSubmit} noValidate>
          <FormField
            id="password"
            label={t('auth.newPassword')}
            type="password"
            name="password"
            placeholder={t('auth.newPassword')}
            value={formData.password}
            onChange={handleChange}
            error={errors.password ? t(errors.password) : undefined}
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          {formData.password && !errors.password && (
            <div className="-mt-2 mb-4">
              <PasswordValidator password={formData.password} />
            </div>
          )}

          <FormField
            id="confirmPassword"
            label={t('auth.confirmPassword')}
            type="password"
            name="confirmPassword"
            placeholder={t('auth.confirmPassword')}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={
              errors.confirmPassword ? t(errors.confirmPassword) : undefined
            }
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          {/* FORM ERROR */}
          {errors.form && (
            <div className="mb-4">
              <div className="flex items-center justify-between rounded-xl border border-error bg-red-50 p-3 text-sm text-error">
                <span>{t(errors.form)}</span>
                <AlertSvg />
              </div>
              {errors.form === 'validation.invalidResetCode' && (
                <div className="mt-2 text-center text-xs">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-deep-blue underline hover:text-deep-blue-950"
                  >
                    {t('auth.sendCode')}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="w-full text-center">
            <Button type="submit" isLoading={isLoading}>
              {t('auth.update')}
            </Button>
          </div>

          <div className="mt-6 mb-6 text-center text-sm">
            <Link
              to="/sign-in"
              className="font-bold text-deep-blue hover:text-deep-blue-950"
            >
              {t('auth.backToSignIn')}
            </Link>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
};

export { UpdatePasswordPage };
