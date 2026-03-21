import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
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

    // 创建用户（UsersService.create 内部统一负责密码哈希）
    const user = await this.usersService.create(registerDto);

    // 生成 tokens
    return this.generateTokens(user);
  }

  // 用户登录
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email, true);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        message: 'Account is disabled',
        code: 'ACCOUNT_DISABLED',
      });
    }

    const isPasswordValid = await this.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
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

    const jwtSecret = this.configService.get<string>('jwt.secret');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    // expiresIn 需与 jsonwebtoken StringValue 兼容，不加泛型保留 any 类型
    const expiresIn = this.configService.get('jwt.expiresIn');
    const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn');

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

    // 存储 refresh token 到 Redis，TTL 与 JWT refreshExpiresIn 保持一致
    const refreshExpiresInStr =
      this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const refreshTtl = this.parseExpiry(refreshExpiresInStr);
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

  // 刷新 token（同时轮换 refresh token，旧 token 即时失效）
  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

      // 验证 refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      // 检查 refresh token 是否在 Redis 中存在（防止重放攻击）
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

      // 生成新的 access token + 轮换 refresh token
      return this.generateTokens(user);
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

  /** 将 '7d' / '30m' / '3600' 格式的过期时间转为秒数 */
  private parseExpiry(expiry: string): number {
    if (/^\d+$/.test(expiry)) return parseInt(expiry, 10);
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (map[unit] ?? 1);
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

    // 使用密码学安全随机数生成令牌
    const cleanToken = randomBytes(32).toString('hex'); // 64 个十六进制字符

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
