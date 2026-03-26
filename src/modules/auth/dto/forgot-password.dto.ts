import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'abc123xyz789...',
  })
  @IsString({ message: 'Token is required' })
  token: string;

  @ApiProperty({
    description: 'New password (min 8 characters)',
    example: 'NewPass123!',
    minLength: 8,
  })
  @IsString({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  newPassword: string;
}

export class VerifyResetTokenDto {
  @ApiProperty({
    description: 'Password reset token to verify',
    example: 'abc123xyz789...',
  })
  @IsString({ message: 'Token is required' })
  token: string;
}
