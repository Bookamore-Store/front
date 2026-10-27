import type { OfferFormData, OfferFormErrors } from './types';

export const validateOfferForm = (
  formData: OfferFormData
): OfferFormErrors => {
  const errors: OfferFormErrors = {};
  const title = formData.title.trim();
  const author = formData.author.trim();
  const description = formData.description.trim();
  
  if (title.length < 5 || title.length > 150) {
    errors.title = 'sellBook.validation.titleLength';
  }
  if (author.length < 5 || author.length > 100) {
    errors.author = 'sellBook.validation.authorLength';
  }
  if (
    description.length > 0 &&
    (description.length < 10 || description.length > 2000)
  ) {
    errors.description = 'sellBook.validation.descriptionLength';
  }
  return errors;
};