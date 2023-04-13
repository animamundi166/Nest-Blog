import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { TagEntity } from './entities/tag.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const createMockReopsitory = () => ({
  findAll: jest.fn(),
});

describe('TagService', () => {
  let service: TagService;
  let tagRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: getRepositoryToken(TagEntity),
          useValue: createMockReopsitory(),
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    tagRepository = module.get<TagService>(getRepositoryToken(TagEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return the array of tags', async () => {
      const expectedTags = ['tag1', 'tag2'];
      tagRepository.find.mockResolveValue(expectedTags);
      const tags = await service.findAll();
      expect(tags).toEqual(expectedTags);
    });
  });
});
