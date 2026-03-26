import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

const createMockHost = (url = '/api/test', method = 'GET') => {
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const mockRequest = { url, method };
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
    mockResponse,
  };
};

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException with string message', () => {
    const { switchToHttp, mockResponse } = createMockHost() as any;
    const host = { switchToHttp } as unknown as ArgumentsHost;
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 404, message: 'Not Found' }),
    );
  });

  it('should handle HttpException with object response', () => {
    const { switchToHttp, mockResponse } = createMockHost() as any;
    const host = { switchToHttp } as unknown as ArgumentsHost;
    const exception = new HttpException(
      { message: 'Unauthorized', code: 'INVALID_CREDENTIALS' },
      HttpStatus.UNAUTHORIZED,
    );

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 401,
        message: 'Unauthorized',
        data: 'INVALID_CREDENTIALS',
      }),
    );
  });

  it('should handle validation error (array of messages)', () => {
    const { switchToHttp, mockResponse } = createMockHost() as any;
    const host = { switchToHttp } as unknown as ArgumentsHost;
    const exception = new HttpException(
      {
        message: [
          'email must be an email',
          'password must be longer than 8 characters',
        ],
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 400,
        message: 'Validation failed',
        data: expect.arrayContaining(['email must be an email']),
      }),
    );
  });

  it('should handle generic Error with 500 status', () => {
    const { switchToHttp, mockResponse } = createMockHost() as any;
    const host = { switchToHttp } as unknown as ArgumentsHost;
    const exception = new Error('Database connection failed');

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 500,
        message: 'Database connection failed',
      }),
    );
  });

  it('should include timestamp and path in error response', () => {
    const { switchToHttp, mockResponse } = createMockHost(
      '/api/users',
      'POST',
    ) as any;
    const host = { switchToHttp } as unknown as ArgumentsHost;
    const exception = new HttpException('Error', 500);

    filter.catch(exception, host);

    const jsonArg = mockResponse.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty('timestamp');
    expect(jsonArg).toHaveProperty('path', '/api/users');
    expect(new Date(jsonArg.timestamp).toString()).not.toBe('Invalid Date');
  });
});
