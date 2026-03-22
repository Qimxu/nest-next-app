import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';

const mockUser: Partial<User> = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── findAll ──────────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      repo.find.mockResolvedValue([mockUser as User]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.arrayContaining(['id', 'email']),
        }),
      );
    });

    it('should return empty array when no users exist', async () => {
      repo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  // ─── findAllPaginated ─────────────────────────────────────────────────────────
  describe('findAllPaginated', () => {
    it('should return paginated result with correct metadata', async () => {
      repo.findAndCount.mockResolvedValue([
        [mockUser as User, mockUser as User],
        25,
      ]);
      const result = await service.findAllPaginated(2, 2);

      expect(result.pagination.total).toBe(25);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.totalPages).toBe(13);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPrevPage).toBe(true);
    });

    it('should indicate no next page on last page', async () => {
      repo.findAndCount.mockResolvedValue([[mockUser as User], 5]);
      const result = await service.findAllPaginated(1, 10);

      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPrevPage).toBe(false);
    });

    it('should use default page=1 limit=10', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await service.findAllPaginated();
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a user by id', async () => {
      repo.findOne.mockResolvedValue(mockUser as User);
      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  // ─── findByEmail ──────────────────────────────────────────────────────────────
  describe('findByEmail', () => {
    it('should find user by email without password by default', async () => {
      repo.findOne.mockResolvedValue(mockUser as User);
      await service.findByEmail('test@example.com');
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should include password when includePassword=true', async () => {
      repo.findOne.mockResolvedValue({
        ...mockUser,
        password: 'hashed',
      } as User);
      await service.findByEmail('test@example.com', true);
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.arrayContaining(['password']),
        }),
      );
    });

    it('should return null for non-existent email', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('noone@example.com');
      expect(result).toBeNull();
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should hash password and return user without password', async () => {
      const savedUser = {
        ...mockUser,
        id: 1,
        password: '$2b$10$hashedpassword',
      } as User;
      repo.create.mockReturnValue(savedUser);
      repo.save.mockResolvedValue(savedUser);

      const result = await service.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'plaintext123',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.stringMatching(/^\$2b\$/),
        }),
      );
      expect(result).not.toHaveProperty('password');
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('should delete a user', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove(1)).resolves.not.toThrow();
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('should update user and return updated data', async () => {
      repo.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      repo.findOne.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      } as User);

      const result = await service.update(1, { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });

    it('should hash password if included in update', async () => {
      repo.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      repo.findOne.mockResolvedValue(mockUser as User);

      await service.update(1, { password: 'newplaintext' });
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ password: expect.stringMatching(/^\$2b\$/) }),
      );
    });

    it('should throw NotFoundException if user does not exist after update', async () => {
      repo.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      repo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── updatePassword ──────────────────────────────────────────────────────────
  describe('updatePassword', () => {
    it('should call repository update with hashed password', async () => {
      repo.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      await service.updatePassword(1, '$2b$10$newhash');
      expect(repo.update).toHaveBeenCalledWith(1, {
        password: '$2b$10$newhash',
      });
    });
  });
});
