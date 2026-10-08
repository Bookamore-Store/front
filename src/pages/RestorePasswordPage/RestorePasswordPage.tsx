import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForgotPasswordMutation } from '@/app/store/api/AuthApi';

import { Button } from '@/shared/ui/Button/Button';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { BottomNav } from '@/shared/ui/BottomNav';
import { FormField } from '@/shared/ui/FormField';
import { AlertSvg } from '@/shared/ui/icons/AlertSvg';
import { validators } from '@/shared/helpers/validators';

interface RestorePasswordFormData {
  email: string;
}

interface FormErrors {
  email?: string;
  form?: string;
}

const INITIAL_FORM_DATA: RestorePasswordFormData = {
  email: '',
};

const RestorePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<RestorePasswordFormData>(INITIAL_FORM_DATA);

  const [errors, setErrors] = useState<FormErrors>({});
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
      form: undefined,
    }));
  };

  const validateForm = () => {
    const email = formData.email.trim();

    let emailError: string | undefined;

    if (!email) {
      emailError = 'validation.emailRequired';
    } else if (!validators.email(email)) {
      emailError = 'validation.emailInvalid';
    }

    setErrors({
      email: emailError,
    });

    return !emailError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isLoading) return;

    const email = formData.email.trim();

    try {
      await forgotPassword({ email }).unwrap();

      navigate('/verification-code', {
        state: { email },
      });
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number | string;
        data?: { message?: string };
      };
      if (apiErr?.status === 503) {
        setErrors((prev) => ({ ...prev, form: 'validation.smtpError' }));
      } else if (apiErr?.status === 400) {
        setErrors((prev) => ({
          ...prev,
          form: apiErr.data?.message || 'validation.emailInvalid',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: apiErr?.data?.message || 'validation.sendCodeError',
        }));
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white">
      <AuthHeader tittle={t('auth.forgotPassword')} />

      <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
        <p className="max-w-[394px] mb-5 text-center text-paragraphm md:text-[16px] text-text-black">
          {t('auth.forgotPasswordDescription')}
        </p>

        <form className="w-full" onSubmit={handleSubmit} noValidate>
          <FormField
            id="email"
            label={t('auth.email')}
            type="email"
            name="email"
            placeholder={t('auth.email')}
            value={formData.email}
            onChange={handleChange}
            error={errors.email ? t(errors.email) : undefined}
            autoComplete="email"
            required
            disabled={isLoading}
          />

          {errors.form && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-error bg-red-50 p-3 text-sm text-error">
              {t(errors.form)}
              <AlertSvg />
            </div>
          )}

          <div className="w-full text-center">
            <Button type="submit" isLoading={isLoading}>
              {t('auth.sendCode')}
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

export { RestorePasswordPage };
