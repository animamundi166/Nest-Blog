import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProfileType } from './types/profile.interface';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new NotFoundException("Profile doesn't exist");
    }

    return this.buildProfileResponse(user, false);
  }

  async followUser(currentUserId: number, username: string) {
    const user = await this.findUserByUsername(username);

    if (currentUserId === user.id) {
      throw new BadRequestException("You can't follow yourself");
    }

    const follow = await this.prisma.follows.findFirst({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    if (!follow) {
      await this.prisma.follows.create({
        data: {
          followerId: currentUserId,
          followingId: user.id,
        },
      });
    }

    return this.buildProfileResponse(user, true);
  }

  async unfollowUser(currentUserId: number, username: string) {
    const user = await this.findUserByUsername(username);

    if (currentUserId === user.id) {
      throw new BadRequestException("You can't unfollow yourself");
    }

    await this.prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id,
        },
      },
    });

    return this.buildProfileResponse(user, false);
  }

  private async findUserByUsername(username: string): Promise<ProfileType> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, bio: true, image: true },
    });

    if (!user) {
      throw new NotFoundException("Profile doesn't exist");
    }

    return user;
  }

  private buildProfileResponse(profile: ProfileType, isFollowing: boolean) {
    delete profile.id;
    return { profile: { ...profile, following: isFollowing } };
  }
}
