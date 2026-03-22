import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@/modules/users/entities/user.entity';

const createMockContext = (user: any, _roles?: UserRole[]) => ({
  getHandler: jest.fn().mockReturnValue({}),
  getClass: jest.fn().mockReturnValue({}),
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue({ user }),
  }),
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext(null, undefined) as any;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when empty roles array is required', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = createMockContext(null, []) as any;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when user is not logged in', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext(undefined, [UserRole.ADMIN]) as any;
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access when user has required role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext({ role: UserRole.ADMIN }, [
      UserRole.ADMIN,
    ]) as any;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when user does not have required role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext({ role: UserRole.USER }, [
      UserRole.ADMIN,
    ]) as any;
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access when user has one of multiple required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
      UserRole.USER,
    ]);
    const context = createMockContext({ role: UserRole.USER }, [
      UserRole.ADMIN,
      UserRole.USER,
    ]) as any;
    expect(guard.canActivate(context)).toBe(true);
  });
});
