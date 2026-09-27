import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/Button/Button';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { BottomNav } from '@/shared/ui/BottomNav';
import { FormField } from '@/shared/ui/FormField';
import { AlertSvg } from '@/shared/ui/icons/AlertSvg';
import { validators } from '@/shared/helpers/validators';
import { useTranslation } from 'react-i18next';
import { PasswordValidator } from '@/modules/auth/ui/PasswordValidator';

interface ValidationError {
  password?: string;
  confirmPassword?: string;
  form?: string;
}

interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

const UpdatePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdatePasswordFormData>({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<ValidationError>({});

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

    if (!validateForm()) return;

    navigate('/sign-in');
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
          />

          {/* FORM ERROR */}
          {errors.form && (
            <div className="flex items-center justify-between mb-4 rounded-xl border border-error bg-red-50 p-3 text-sm text-error">
              {t(errors.form)}
              <AlertSvg />
            </div>
          )}

          <div className="w-full text-center">
            <Button type="submit">{t('auth.update')}</Button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
};

export { UpdatePasswordPage };
