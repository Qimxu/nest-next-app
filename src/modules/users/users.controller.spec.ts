import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAllPaginated: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const paginatedResult = {
        users: [mockUser],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      usersService.findAllPaginated.mockResolvedValue(paginatedResult as any);

      const result = await controller.getUsers(1, 10);
      expect(result).toEqual(paginatedResult);
      expect(usersService.findAllPaginated).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      const req = { user: { userId: 1 } };
      const result = await controller.getProfile(req as any);
      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      const result = await controller.getUser('1');
      expect(result).toEqual({ user: mockUser });
    });

    it('should throw NotFoundException if user not found', async () => {
      usersService.findOne.mockResolvedValue(null);
      await expect(controller.getUser('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      usersService.create.mockResolvedValue(mockUser as any);
      const dto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'Pass@1234',
      };
      const result = await controller.createUser(dto);
      expect(result).toEqual({
        message: 'User created successfully',
        user: mockUser,
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updated = { ...mockUser, name: 'Updated' };
      usersService.update.mockResolvedValue(updated as any);
      const req = { user: { userId: 99 } };
      const result = await controller.updateUser(
        '1',
        { name: 'Updated' },
        req as any,
      );
      expect(result.message).toBe('User updated successfully');
      expect(result.updatedBy).toBe(99);
    });
  });

  describe('removeUser', () => {
    it('should remove a user', async () => {
      usersService.remove.mockResolvedValue(undefined);
      const req = { user: { userId: 99 } };
      const result = await controller.removeUser('1', req as any);
      expect(result.message).toBe('User deleted successfully');
      expect(usersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
