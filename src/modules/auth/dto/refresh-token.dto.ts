import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  // 可选：浏览器客户端通过 httpOnly Cookie 自动携带，无需在 body 中传入；
  // 非浏览器客户端（Postman、移动 App）可在 body 中显式传入
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
