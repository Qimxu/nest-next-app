import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { BusinessException } from '../../core/exceptions/business.exception';
import { UserRole } from '../users/entities/user.entity';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  password: '$2b$10$hashedpassword',
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let redisService: jest.Mocked<RedisService>;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn().mockResolvedValue(undefined),
            get: jest.fn(),
            del: jest.fn().mockResolvedValue(undefined),
            exists: jest.fn().mockResolvedValue(false),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                'jwt.secret': 'test_secret',
                'jwt.refreshSecret': 'test_refresh_secret',
                'jwt.expiresIn': '30m',
                'jwt.refreshExpiresIn': '7d',
                'app.apiBaseUrl': 'http://localhost:3000',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    redisService = module.get(RedisService);
    usersService = module.get(UsersService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── hashPassword ────────────────────────────────────────────────────────────
  describe('hashPassword', () => {
    it('should return a bcrypt hash', async () => {
      const hash = await service.hashPassword('plaintext');
      expect(hash).toMatch(/^\$2b\$/);
      expect(hash).not.toBe('plaintext');
    });

    it('should produce different hashes for the same input', async () => {
      const hash1 = await service.hashPassword('same');
      const hash2 = await service.hashPassword('same');
      expect(hash1).not.toBe(hash2);
    });
  });

  // ─── validatePassword ────────────────────────────────────────────────────────
  describe('validatePassword', () => {
    it('should return true for correct password', async () => {
      const hash = await service.hashPassword('correctPass');
      const result = await service.validatePassword('correctPass', hash);
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await service.hashPassword('correctPass');
      const result = await service.validatePassword('wrongPass', hash);
      expect(result).toBe(false);
    });
  });

  // ─── register ────────────────────────────────────────────────────────────────
  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('access_token');

      const result = await service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BusinessException if email already registered', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(
        service.register({
          name: 'Test',
          email: 'test@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(BusinessException);
    });
  });

  // ─── login ───────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const hash = await service.hashPassword('Password123!');
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hash,
      } as any);
      jwtService.sign.mockReturnValue('access_token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is disabled', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as any);

      await expect(
        service.login({ email: 'test@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hash = await service.hashPassword('CorrectPass!');
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hash,
      } as any);

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPass!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── refreshToken ────────────────────────────────────────────────────────────
  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      jwtService.verify.mockReturnValue({
        sub: 1,
        email: 'test@example.com',
      } as any);
      redisService.get.mockResolvedValue('valid_refresh_token');
      usersService.findOne.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('new_access_token');

      const result = await service.refreshToken('valid_refresh_token');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw UnauthorizedException if stored token does not match', async () => {
      jwtService.verify.mockReturnValue({ sub: 1 } as any);
      redisService.get.mockResolvedValue('different_token');

      await expect(service.refreshToken('provided_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jwtService.verify.mockReturnValue({ sub: 999 } as any);
      redisService.get.mockResolvedValue('valid_refresh_token');
      usersService.findOne.mockResolvedValue(null);

      await expect(service.refreshToken('valid_refresh_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is disabled', async () => {
      jwtService.verify.mockReturnValue({ sub: 1 } as any);
      redisService.get.mockResolvedValue('valid_refresh_token');
      usersService.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as any);

      await expect(service.refreshToken('valid_refresh_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if verify throws', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshToken('expired_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('should blacklist access token and delete refresh token', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      jwtService.decode.mockReturnValue({ exp: futureExp } as any);

      await service.logout(1, 'access_token_value');

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('token_blacklist:'),
        expect.objectContaining({ blacklisted: true }),
        expect.any(Number),
      );
      expect(redisService.del).toHaveBeenCalledWith('refresh_token:1');
    });

    it('should not fail if token is already expired', async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      jwtService.decode.mockReturnValue({ exp: pastExp } as any);

      await expect(service.logout(1, 'expired_token')).resolves.not.toThrow();
      expect(redisService.set).not.toHaveBeenCalled();
    });

    it('should not throw even if decode throws', async () => {
      jwtService.decode.mockImplementation(() => {
        throw new Error('decode error');
      });

      await expect(service.logout(1, 'bad_token')).resolves.not.toThrow();
    });
  });

  // ─── isTokenBlacklisted ──────────────────────────────────────────────────────
  describe('isTokenBlacklisted', () => {
    it('should return true when token is blacklisted', async () => {
      redisService.exists.mockResolvedValue(true);
      const result = await service.isTokenBlacklisted('blacklisted_token');
      expect(result).toBe(true);
    });

    it('should return false when token is not blacklisted', async () => {
      redisService.exists.mockResolvedValue(false);
      const result = await service.isTokenBlacklisted('clean_token');
      expect(result).toBe(false);
    });
  });

  // ─── generatePasswordResetToken ──────────────────────────────────────────────
  describe('generatePasswordResetToken', () => {
    it('should return null if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const result = await service.generatePasswordResetToken(
        'notfound@example.com',
      );
      expect(result).toBeNull();
    });

    it('should return token and resetUrl for existing user', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      const result =
        await service.generatePasswordResetToken('test@example.com');

      expect(result).not.toBeNull();
      expect(result?.token).toHaveLength(64);
      expect(result?.resetUrl).toContain('/reset-password?token=');
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('password_reset:'),
        expect.objectContaining({ userId: 1, email: 'test@example.com' }),
        3600,
      );
    });
  });

  // ─── resetPassword ───────────────────────────────────────────────────────────
  describe('resetPassword', () => {
    it('should return false if token is invalid', async () => {
      redisService.get.mockResolvedValue(null);
      const result = await service.resetPassword(
        'invalid_token',
        'NewPass123!',
      );
      expect(result).toBe(false);
    });

    it('should reset password and clean up tokens', async () => {
      redisService.get.mockResolvedValue({
        userId: 1,
        email: 'test@example.com',
      });

      const result = await service.resetPassword('valid_token', 'NewPass123!');

      expect(result).toBe(true);
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        1,
        expect.stringMatching(/^\$2b\$/),
      );
      expect(redisService.del).toHaveBeenCalledWith(
        'password_reset:valid_token',
      );
      expect(redisService.del).toHaveBeenCalledWith('refresh_token:1');
    });
  });

  // ─── parseExpiry (private, tested via generateTokens side-effects) ───────────
  describe('parseExpiry (via token generation)', () => {
    it.each([
      ['30m', 1800],
      ['7d', 604800],
      ['3600', 3600],
      ['1h', 3600],
      ['24h', 86400],
    ])('should parse expiry "%s" correctly', async (expiry, expectedTtl) => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'jwt.refreshExpiresIn') return expiry;
        const defaults: Record<string, string> = {
          'jwt.secret': 'sec',
          'jwt.refreshSecret': 'ref',
          'jwt.expiresIn': '30m',
        };
        return defaults[key];
      });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);

      await service.register({
        name: 'T',
        email: 'a@b.com',
        password: '12345678',
      });

      expect(redisService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expectedTtl,
      );
    });
  });
});
