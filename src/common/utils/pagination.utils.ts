import { PaginationOptions, PaginatedResponse, PaginationMeta } from '../interfaces/pagination.interface';

export class PaginationUtils {
  static createPaginationObject<T>(
    items: T[],
    total: number,
    options: PaginationOptions,
  ): PaginatedResponse<T> {
    const { page = 1, limit = 10 } = options;
    const lastPage = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      total,
      page,
      lastPage,
      limit,
    };

    return {
      data: items,
      meta,
    };
  }

  static getSkipTake(options: PaginationOptions): { skip: number; take: number } {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
    };
  }

  static createOrderObject(
    sortBy?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): { [key: string]: 'ASC' | 'DESC' } {
    if (!sortBy) {
      return { createdAt: 'DESC' };
    }

    return { [sortBy]: order };
  }
}
