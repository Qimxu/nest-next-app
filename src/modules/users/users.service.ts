import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const [users, total] = await this.usersRepository.findAndCount({
      select: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    const options: any = { where: { email } };
    if (includePassword) {
      options.select = [
        'id',
        'name',
        'email',
        'password',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ];
    }
    return this.usersRepository.findOne(options);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;
    return result as User;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    // 如果更新包含密码，需要哈希处理
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.usersRepository.update(id, updateData);
    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(id, { password: hashedPassword });
  }
}
