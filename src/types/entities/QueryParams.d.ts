import { Nullable } from '@types/utils/Nullable';
import type { OfferSortBy } from '@types/entities/Offer';

export type QueryParams = Nullable<{
  page?: string | number;
  size?: string | number;
  sortBy?: OfferSortBy;
  sortDir?: 'asc' | 'desc';
  genres?: string | string[];
  condition?: string;
  search?: string;
  sellerId?: string | number;
}>;
