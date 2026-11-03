import { Nullable } from '@types/utils/Nullable';
import type { OfferSortBy } from '@types/entities/Offer';

export type QueryParams = Nullable<{
  page?: string | number;
  size?: string | number;
  sort?: `${OfferSortBy},${'asc' | 'desc'}`;
  genre?: string | string[];
  author?: string[];
  condition?: string;
  search?: string;
  sellerId?: string[];
}>;
