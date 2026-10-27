import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CrossSvg } from '@/shared/ui/icons/CrossSvg';
import noImages from '@/assest/images/noImage.jpg';
import { useSendOfferMessageMutation } from '@/app/store/api/ChatsApi';
import { Button } from '@/shared/ui/Button/Button';
import type { Book } from '@/types/entities/Book';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: string;
  price: number;
  book: Book;
  sellerName: string;
}

export const ContactSellerModal: React.FC<ContactSellerModalProps> = ({
  isOpen,
  onClose,
  offerId,
  price,
  book,
  sellerName,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [message, setMessage] = useState(
    t('contactSellerModal.messageDefault')
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sendOfferMessage, { isLoading }] = useSendOfferMessageMutation();

  if (!isOpen) return null;

  const getErrorMessage = (error: unknown): string => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'data' in error &&
      typeof error.data === 'object' &&
      error.data !== null &&
      'message' in error.data &&
      typeof error.data.message === 'string'
    ) {
      return error.data.message;
    }

    return t('contactSellerModal.errorSendingMessage');
  };

  const handleSend = async () => {
    const content = message.trim();
    if (!content || isLoading) return;

    setErrorMessage(null);

    try {
      await sendOfferMessage({
        offerId,
        content,
      }).unwrap();

      setMessage(t('contactSellerModal.messageDefault'));
      setErrorMessage(null);

      onClose();
      navigate('/chats?tab=buying');
    } catch (error: unknown) {
      console.error('Failed to send offer message:', error);
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleClose = () => {
    if (isLoading) return;

    setMessage(t('contactSellerModal.messageDefault'));
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative space-y-3 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-150">
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          aria-label={t('contactSellerModal.close')}
          className="absolute top-3 right-3 rounded-full p-1 cursor-pointer hover:bg-grass-100 outline-grass-500 focus:bg-grass-100"
        >
          <CrossSvg className="text-icons-black" />
        </button>
        <h3 className="text-lg text-text-black">
          {t('contactSellerModal.сontact')}{' '}
          <span className="font-semibold">{sellerName}</span>
        </h3>
        <div className="flex gap-3 h-24 items-start border-b border-gray-100">
          <img
            src={
              book.images[0]?.path
                ? `${IMAGE_HOST}${book.images[0]?.path}`
                : noImages
            }
            alt={book.title}
            className="w-16 h-full object-cover rounded-md"
          />
          <div className="flex flex-col justify-between h-full text-xs text-text-black">
            <div>
              <p className="text-sm line-clamp-1 font-semibold overflow-hidden text-overflow-ellipsis">
                {book.title}
              </p>
              <p>
                {t('common.by')} {book.authors.join(', ')}
              </p>
            </div>
            <div>
              <p>{t('titles.price')}</p>
              <p className="text-lg font-bold text-text-black">{price} UAH</p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="">
          <label
            htmlFor="offer-message"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            {t('contactSellerModal.messageLabel')}
          </label>
          <textarea
            id="offer-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            disabled={isLoading}
            className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm focus:border-aquamarine-500 focus:outline-none focus:ring-1 focus:ring-aquamarine-500 disabled:bg-gray-50"
            placeholder={t('contactSellerModal.messagePlaceholder')}
          />
        </div>

        <div className="flex items-center justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="w-auto"
          >
            {t('contactSellerModal.cancel')}
          </Button>

          <Button
            type="button"
            onClick={() => void handleSend()}
            disabled={!message.trim() || isLoading}
            className="flex items-center justify-center gap-2"
          >
            {isLoading
              ? t('contactSellerModal.sendingMessage')
              : t('contactSellerModal.sendMessage')}
          </Button>
        </div>
      </div>
    </div>
  );
};
