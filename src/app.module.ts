import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TagsModule } from './tags/tags.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TagsModule, UserModule, ProfileModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
