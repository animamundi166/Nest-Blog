import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TagsModule } from './tags/tags.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TagsModule, UserModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
