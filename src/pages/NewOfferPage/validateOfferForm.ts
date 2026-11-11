import type { OfferFormData, OfferFormErrors } from './types';

export const validateOfferForm = (formData: OfferFormData): OfferFormErrors => {
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
  if (!formData.price.trim()) {
    errors.price = 'sellBook.validation.priceRequired';
  }
  if (!description) {
    errors.description = 'sellBook.validation.descriptionRequired';
  } else if (description.length < 10 || description.length > 2000) {
    errors.description = 'sellBook.validation.descriptionLength';
  }
  if (formData.genres.length === 0) {
    errors.genres = 'sellBook.validation.genresRequired';
  }
  return errors;
};
