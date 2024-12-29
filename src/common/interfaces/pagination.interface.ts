export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}
