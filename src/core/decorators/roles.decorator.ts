import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * 角色守卫装饰器
 * 用于限制只有特定角色的用户才能访问接口
 *
 * @example
 * @Roles(UserRole.ADMIN)
 * @Delete(':id')
 * deleteUser() {}
 *
 * @example
 * @Roles(UserRole.ADMIN, UserRole.USER)
 * @Get('profile')
 * getProfile() {}
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
