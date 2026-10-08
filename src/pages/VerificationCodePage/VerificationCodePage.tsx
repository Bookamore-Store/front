import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '@/shared/ui/Button/Button';
import { AuthHeader } from '@/shared/ui/AuthHeader';
import { BottomNav } from '@/shared/ui/BottomNav';
import { AlertSvg } from '@/shared/ui/icons/AlertSvg';
import { PinInput } from '@/shared/ui/PinInput';
import { useTranslation } from 'react-i18next';
import { useForgotPasswordMutation } from '@/app/store/api/AuthApi';

interface ValidationError {
  code?: string;
  form?: string;
}

interface VerificationCodeFormData {
  code: string;
}

interface VerificationCodeLocationState {
  email?: string;
}

const VerificationCodePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const email =
    (location.state as VerificationCodeLocationState | null)?.email ?? '';

  const [formData, setFormData] = useState<VerificationCodeFormData>({
    code: '',
  });

  const [errors, setErrors] = useState<ValidationError>({});
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const [forgotPassword, { isLoading: isResending }] =
    useForgotPasswordMutation();

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const clearFieldError = (field: keyof VerificationCodeFormData) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      form: undefined,
    }));
  };

  const handlePinChange = (pin: string) => {
    setFormData({ code: pin });
    clearFieldError('code');
  };

  const handlePinComplete = (pin: string) => {
    setFormData({ code: pin });
    clearFieldError('code');
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};

    if (!formData.code.trim()) {
      newErrors.code = 'validation.codeRequired';
    } else if (formData.code.trim().length < 6) {
      newErrors.code = 'validation.codeIncomplete';
    }

    setErrors(newErrors);

    return !Object.keys(newErrors).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    navigate('/update-password', {
      state: { email, code: formData.code.trim() },
    });
  };

  const handleResendCode = async () => {
    if (!email || resendCountdown > 0 || isResending) return;

    try {
      await forgotPassword({ email }).unwrap();
      setResendSuccess(true);
      setResendCountdown(60);
      setErrors((prev) => ({ ...prev, form: undefined }));
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number | string;
        data?: { message?: string };
      };
      if (apiErr?.status === 503) {
        setErrors((prev) => ({ ...prev, form: 'validation.smtpError' }));
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
      <AuthHeader tittle={t('auth.verificationCode')} />

      <div className="w-full max-w-sm px-6 space-y-9">
        <p className="text-center text-paragraphm text-text-black">
          {t('auth.verificationCodeDescription', { email })}
        </p>

        <form className="w-full" onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <PinInput
              onComplete={handlePinComplete}
              onChange={handlePinChange}
              error={!!errors.code}
              disabled={isResending}
            />
            {errors.code && (
              <p className="mt-2 ml-1 text-sm text-error">{t(errors.code)}</p>
            )}
          </div>

          {/* FORM ERROR */}
          {errors.form && (
            <div className="flex items-center justify-between mb-4 rounded-xl border border-error bg-red-50 p-3 text-sm text-error">
              {t(errors.form)}
              <AlertSvg />
            </div>
          )}

          {resendSuccess && (
            <div className="flex items-center justify-center mb-4 rounded-xl border border-green-500 bg-green-50 p-3 text-sm text-green-700">
              {t('auth.codeSent')}
            </div>
          )}

          <div className="w-full text-center">
            <Button type="submit">{t('auth.confirm')}</Button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500">
          {t('auth.didNotReceiveCode')}{' '}
          {resendCountdown > 0 ? (
            <span className="font-semibold text-gray-400">
              {t('auth.resendIn', { seconds: resendCountdown })}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="font-semibold text-deep-blue underline hover:text-deep-blue-950 cursor-pointer disabled:opacity-50"
            >
              {isResending ? '...' : t('auth.resendCode')}
            </button>
          )}
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export { VerificationCodePage };
