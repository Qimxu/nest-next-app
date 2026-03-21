import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Request,
  Response,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyResetTokenDto,
} from './dto';
import { Public, Throttle } from '@/core/decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @Throttle({ ttlMs: 60_000, limit: 5 })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Response({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.register(registerDto);
    this.setAuthCookies(res, result.access_token, result.refresh_token);
    return result;
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ ttlMs: 60_000, limit: 10 })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Response({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(loginDto);
    this.setAuthCookies(res, result.access_token, result.refresh_token);
    return result;
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token (rotates refresh token)' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Headers('cookie') cookieHeader: string,
    @Response({ passthrough: true }) res: any,
  ) {
    // 浏览器客户端：从 httpOnly Cookie 读取（更安全，JS 无法访问）
    // 非浏览器客户端：从 request body 读取（Postman、移动 App）
    const refreshToken =
      this.parseCookieValue(cookieHeader, 'refresh_token') ||
      refreshTokenDto.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refreshToken(refreshToken);
    this.setAuthCookies(res, result.access_token, result.refresh_token);
    return { access_token: result.access_token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current user' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Request() req: any,
    @Headers('authorization') authorization: string,
    @Response({ passthrough: true }) res: any,
  ) {
    const token = authorization?.replace('Bearer ', '');
    if (token) {
      await this.authService.logout(req.user.userId, token);
    }
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  /**
   * 设置认证 Cookies（maxAge 与 JWT expiresIn 保持一致）
   */
  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const expiresIn = this.configService.get<string>('jwt.expiresIn', '30m');
    const refreshExpiresIn = this.configService.get<string>(
      'jwt.refreshExpiresIn',
      '7d',
    );

    // access_token - 客户端可读，用于 API 请求（非 httpOnly）
    res.cookie('access_token', accessToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: this.parseExpiryMs(expiresIn),
      path: '/',
    });

    // refresh_token - 仅服务端可读，防 XSS（httpOnly）
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: this.parseExpiryMs(refreshExpiresIn),
      path: '/',
    });
  }

  /**
   * 清除认证 Cookies
   */
  private clearAuthCookies(res: any) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  /**
   * 从 Cookie header 字符串中提取指定 key 的值
   */
  private parseCookieValue(
    cookieHeader: string | undefined,
    name: string,
  ): string | null {
    if (!cookieHeader) return null;
    for (const part of cookieHeader.split(';')) {
      const [key, val] = part.trim().split('=');
      if (key === name) return val ? decodeURIComponent(val) : null;
    }
    return null;
  }

  /**
   * 将 '30m' / '7d' / '3600' 格式的过期时间转换为毫秒
   */
  private parseExpiryMs(expiry: string): number {
    if (/^\d+$/.test(expiry)) return parseInt(expiry, 10) * 1000;
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const map: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return value * (map[unit] ?? 1_000);
  }

  // ========== 忘记密码端点 ==========

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ ttlMs: 60_000, limit: 3 })
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent if account exists',
  })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.generatePasswordResetToken(
      forgotPasswordDto.email,
    );

    // 为了安全，无论邮箱是否存在都返回相同消息
    // 实际生产环境应该发送邮件，这里返回重置 URL（仅用于开发测试）
    if (result) {
      // TODO: 集成邮件服务发送重置链接
      // await this.mailService.sendPasswordReset(forgotPasswordDto.email, result.resetUrl);
      this.logger.log(`Password reset URL: ${result.resetUrl}`);

      // 只返回 token，前端根据当前 locale 构建完整 URL
      return {
        success: true,
        message: 'Password reset link generated successfully',
        token: result.token,
      };
    }

    // 邮箱不存在时也返回相同格式，避免枚举攻击
    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent',
      token: '',
    };
  }

  @Post('verify-reset-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password reset token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyResetToken(@Body() verifyDto: VerifyResetTokenDto) {
    const tokenData = await this.authService.validateResetToken(
      verifyDto.token,
    );

    if (!tokenData) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    return {
      message: 'Token is valid',
      email: tokenData.email,
    };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or password requirements not met',
  })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    const success = await this.authService.resetPassword(
      resetDto.token,
      resetDto.newPassword,
    );

    if (!success) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    return {
      message:
        'Password has been reset successfully. Please login with your new password.',
    };
  }
}
