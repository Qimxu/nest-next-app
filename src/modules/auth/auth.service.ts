import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BusinessException } from '../../core/exceptions/business.exception';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly TOKEN_BLACKLIST_PREFIX = 'token_blacklist:';
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';

  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  // 密码加密
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // 密码验证
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // 用户注册
  async register(registerDto: RegisterDto) {
    // 检查用户是否已存在
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BusinessException('Email already registered');
    }

    // 加密密码并创建用户
    const hashedPassword = await this.hashPassword(registerDto.password);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // 生成 tokens
    return this.generateTokens(user);
  }

  // 用户登录
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email, true);
    if (!user) {
      throw new UnauthorizedException({
        message: '账号或密码不存在',
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        message: '账号已被禁用',
        code: 'ACCOUNT_DISABLED',
      });
    }

    const isPasswordValid = await this.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: '账号或密码不存在',
        code: 'INVALID_CREDENTIALS',
      });
    }

    return this.generateTokens(user);
  }

  // 生成 tokens
  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtSecret = this.configService.get('jwt.secret') || 'your-secret-key';
    const refreshSecret =
      this.configService.get('jwt.refreshSecret') || jwtSecret + '-refresh';
    const expiresIn = this.configService.get('jwt.expiresIn') || '30m';
    const refreshExpiresIn =
      this.configService.get('jwt.refreshExpiresIn') || '7d';

    // Access token (short-lived)
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: expiresIn,
    });

    // Refresh token (long-lived)
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    // 存储 refresh token 到 Redis
    const refreshTtl = 7 * 24 * 60 * 60; // 7 days in seconds
    await this.redisService.set(
      `${this.REFRESH_TOKEN_PREFIX}${user.id}`,
      refreshToken,
      refreshTtl,
    );

    this.logger.log(`User logged in: ${user.email}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // 刷新 token
  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret =
        this.configService.get('jwt.refreshSecret') ||
        this.configService.get('jwt.secret') + '-refresh';

      // 验证 refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      // 检查 refresh token 是否在 Redis 中存在
      const storedToken = await this.redisService.get<string>(
        `${this.REFRESH_TOKEN_PREFIX}${payload.sub}`,
      );
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 获取用户信息
      const user = await this.usersService.findOne(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or disabled');
      }

      // 生成新的 access token
      const jwtSecret =
        this.configService.get('jwt.secret') || 'your-secret-key';
      const expiresIn = this.configService.get('jwt.expiresIn') || '30m';

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(newPayload, {
        secret: jwtSecret,
        expiresIn: expiresIn,
      });

      return { access_token: accessToken };
    } catch (error) {
      this.logger.error('Refresh token error:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // 登出
  async logout(userId: number, token: string) {
    try {
      // 将 access token 加入黑名单
      const decoded = this.jwtService.decode(token) as any;
      if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redisService.set(
            `${this.TOKEN_BLACKLIST_PREFIX}${token}`,
            { blacklisted: true, reason: 'logout' },
            ttl,
          );
        }
      }

      // 删除 refresh token
      await this.redisService.del(`${this.REFRESH_TOKEN_PREFIX}${userId}`);

      this.logger.log(`User logged out: ${userId}`);
    } catch (error) {
      this.logger.error('Logout error:', error.message);
    }
  }

  // 检查 token 是否在黑名单中
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.redisService.exists(`${this.TOKEN_BLACKLIST_PREFIX}${token}`);
  }

  // ========== 忘记密码功能 ==========

  private readonly RESET_TOKEN_PREFIX = 'password_reset:';
  private readonly RESET_TOKEN_EXPIRY = 3600; // 1 hour in seconds

  /**
   * 生成密码重置令牌
   */
  async generatePasswordResetToken(
    email: string,
  ): Promise<{ token: string; resetUrl: string } | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // 为了安全，不暴露邮箱是否存在
      return null;
    }

    // 生成随机令牌
    const token = await bcrypt.hash(
      `${user.id}-${Date.now()}-${Math.random()}`,
      10,
    );
    const cleanToken = token.replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);

    // 存储到 Redis，设置1小时过期
    await this.redisService.set(
      `${this.RESET_TOKEN_PREFIX}${cleanToken}`,
      { userId: user.id, email: user.email },
      this.RESET_TOKEN_EXPIRY,
    );

    const baseUrl =
      this.configService.get('app.apiBaseUrl') || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${cleanToken}`;

    this.logger.log(`Password reset token generated for: ${email}`);

    return { token: cleanToken, resetUrl };
  }

  /**
   * 验证密码重置令牌
   */
  async validateResetToken(
    token: string,
  ): Promise<{ userId: number; email: string } | null> {
    const data = await this.redisService.get<{ userId: number; email: string }>(
      `${this.RESET_TOKEN_PREFIX}${token}`,
    );

    if (!data) {
      return null;
    }

    return data;
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const tokenData = await this.validateResetToken(token);
    if (!tokenData) {
      return false;
    }

    // 哈希新密码
    const hashedPassword = await this.hashPassword(newPassword);

    // 更新用户密码
    await this.usersService.updatePassword(tokenData.userId, hashedPassword);

    // 删除重置令牌（使其失效）
    await this.redisService.del(`${this.RESET_TOKEN_PREFIX}${token}`);

    // 清除该用户的所有 refresh token（强制重新登录）
    await this.redisService.del(
      `${this.REFRESH_TOKEN_PREFIX}${tokenData.userId}`,
    );

    this.logger.log(`Password reset successful for user: ${tokenData.userId}`);

    return true;
  }
}
