import {
  ApiResponse,
  PaginatedResponse,
  PaginatedData,
} from '../interfaces/response.interface';

/**
 * 响应工具类
 * 用于构建统一的 API 响应格式
 */
export class ResponseHelper {
  /**
   * 成功响应
   */
  static success<T>(
    data: T,
    message: string = 'Success',
  ): Omit<ApiResponse<T>, 'timestamp' | 'path'> {
    return {
      code: 200,
      message,
      data,
    };
  }

  /**
   * 创建成功响应 (201)
   */
  static created<T>(
    data: T,
    message: string = 'Created successfully',
  ): Omit<ApiResponse<T>, 'timestamp' | 'path'> {
    return {
      code: 201,
      message,
      data,
    };
  }

  /**
   * 无内容响应 (204)
   */
  static noContent(): Omit<ApiResponse<null>, 'timestamp' | 'path'> {
    return {
      code: 204,
      message: 'No content',
      data: null,
    };
  }

  /**
   * 分页响应
   */
  static paginated<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
  ): Omit<PaginatedResponse<T>, 'timestamp' | 'path'> {
    const totalPages = Math.ceil(total / pageSize);
    const data: PaginatedData<T> = {
      list,
      total,
      page,
      pageSize,
      totalPages,
    };

    return {
      code: 200,
      message: 'Success',
      data,
    };
  }

  /**
   * 错误响应
   */
  static error(
    message: string,
    code: number = 500,
    data: any = null,
  ): Omit<ApiResponse, 'timestamp' | 'path'> {
    return {
      code,
      message,
      data,
    };
  }
}
