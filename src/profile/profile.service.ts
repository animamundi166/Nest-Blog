import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './entities/profile.entity';
import { ProfileType } from './types/profile.type';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOneBy({
      username: profileUsername,
    });

    if (!user) {
      throw new NotFoundException("Profile doesn't exist");
    }

    if (currentUserId === undefined) {
      return { ...user, following: false };
    }

    const follow = await this.followRepository.findOneBy({
      followerId: currentUserId,
      followingId: user.id,
    });

    return { ...user, following: Boolean(follow) };
  }

  async followProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOneBy({
      username: profileUsername,
    });

    if (!user) {
      throw new NotFoundException("Profile doesn't exist");
    }

    if (currentUserId === user.id) {
      throw new BadRequestException("Follower and following can't be equal");
    }

    const follow = await this.followRepository.findOneBy({
      followerId: currentUserId,
      followingId: user.id,
    });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return { ...user, following: true };
  }

  async unfollowProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOneBy({
      username: profileUsername,
    });

    if (!user) {
      throw new NotFoundException("Profile doesn't exist");
    }

    if (currentUserId === user.id) {
      throw new BadRequestException("Follower and following can't be equal");
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });

    return { ...user, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }
}
