import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

// Mock IORedis
const mockRedisClient = {
  set: jest.fn().mockResolvedValue('OK'),
  setex: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn(),
  expire: jest.fn().mockResolvedValue(1),
  ttl: jest.fn().mockResolvedValue(3600),
  on: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const cfg: Record<string, any> = {
                'redis.host': 'localhost',
                'redis.port': 6379,
                'redis.password': undefined,
                'redis.db': 0,
              };
              return cfg[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── set ──────────────────────────────────────────────────────────────────────
  describe('set', () => {
    it('should call setex when ttl is provided', async () => {
      await service.set('key1', { data: 'value' }, 60);
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'key1',
        60,
        JSON.stringify({ data: 'value' }),
      );
    });

    it('should call set without ttl when ttl is not provided', async () => {
      await service.set('key2', 'string_value');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'key2',
        JSON.stringify('string_value'),
      );
    });

    it('should serialize objects to JSON', async () => {
      await service.set('obj', { a: 1, b: 'test' }, 100);
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'obj',
        100,
        '{"a":1,"b":"test"}',
      );
    });
  });

  // ─── get ──────────────────────────────────────────────────────────────────────
  describe('get', () => {
    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const result = await service.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should parse JSON when value is stored as JSON', async () => {
      mockRedisClient.get.mockResolvedValue(
        '{"userId":1,"email":"test@example.com"}',
      );
      const result = await service.get<{ userId: number }>('user_key');
      expect(result).toEqual({ userId: 1, email: 'test@example.com' });
    });

    it('should return raw string if JSON.parse fails', async () => {
      mockRedisClient.get.mockResolvedValue('not-valid-json');
      const result = await service.get('raw_key');
      expect(result).toBe('not-valid-json');
    });

    it('should return boolean value when stored as JSON', async () => {
      mockRedisClient.get.mockResolvedValue('true');
      const result = await service.get('bool_key');
      expect(result).toBe(true);
    });
  });

  // ─── del ──────────────────────────────────────────────────────────────────────
  describe('del', () => {
    it('should call redis del', async () => {
      await service.del('to_delete');
      expect(mockRedisClient.del).toHaveBeenCalledWith('to_delete');
    });
  });

  // ─── exists ──────────────────────────────────────────────────────────────────
  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedisClient.exists.mockResolvedValue(1);
      const result = await service.exists('existing_key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.exists.mockResolvedValue(0);
      const result = await service.exists('missing_key');
      expect(result).toBe(false);
    });
  });

  // ─── expire ──────────────────────────────────────────────────────────────────
  describe('expire', () => {
    it('should call redis expire with key and ttl', async () => {
      await service.expire('some_key', 300);
      expect(mockRedisClient.expire).toHaveBeenCalledWith('some_key', 300);
    });
  });

  // ─── ttl ─────────────────────────────────────────────────────────────────────
  describe('ttl', () => {
    it('should return remaining TTL for a key', async () => {
      mockRedisClient.ttl.mockResolvedValue(1800);
      const result = await service.ttl('some_key');
      expect(result).toBe(1800);
    });
  });
});
