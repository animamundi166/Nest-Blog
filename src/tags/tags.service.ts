import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTags(): Promise<{ tags: string[] }> {
    const tags = await this.prisma.tags.findMany();
    const mappedTags = tags.map((tag) => tag.name);
    return { tags: mappedTags };
  }
}
