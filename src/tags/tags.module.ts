import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  controllers: [TagsController],
  providers: [TagsService, PrismaService],
})
export class TagsModule {}
