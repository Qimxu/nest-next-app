import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockTokens = { access_token: 'access_tok', refresh_token: 'refresh_tok' };

const mockRes = () => ({
  cookie: jest.fn(),
  clearCookie: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const cfg: Record<string, string> = {
                'jwt.expiresIn': '30m',
                'jwt.refreshExpiresIn': '7d',
              };
              return cfg[key] ?? '';
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and set cookies', async () => {
      authService.register.mockResolvedValue(mockTokens);
      const res = mockRes();

      const result = await controller.register(
        { name: 'Test', email: 'test@example.com', password: 'Pass1234!' },
        res as any,
      );

      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('login', () => {
    it('should call authService.login and set cookies', async () => {
      authService.login.mockResolvedValue(mockTokens);
      const res = mockRes();

      const result = await controller.login(
        { email: 'test@example.com', password: 'Pass1234!' },
        res as any,
      );

      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('should call authService.logout and clear cookies', async () => {
      authService.logout.mockResolvedValue(undefined);
      const res = mockRes();
      const req = { user: { userId: 1 } };

      const result = await controller.logout(
        req as any,
        'Bearer valid_token',
        res as any,
      );

      expect(authService.logout).toHaveBeenCalledWith(1, 'valid_token');
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('refreshToken', () => {
    it('should refresh using body token when no cookie present', async () => {
      authService.refreshToken.mockResolvedValue(mockTokens);
      const res = mockRes();

      const result = await controller.refreshToken(
        { refreshToken: 'body_refresh_token' },
        undefined as any,
        res as any,
      );

      expect(authService.refreshToken).toHaveBeenCalledWith(
        'body_refresh_token',
      );
      expect(result).toHaveProperty('access_token');
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      await expect(
        controller.refreshToken({}, undefined as any, mockRes() as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
