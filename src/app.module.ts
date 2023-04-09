import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [TagsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
