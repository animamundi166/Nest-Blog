import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Auth } from 'src/user/decorators/auth.decorator';
import { CurrentUser } from 'src/user/decorators/user.decorator';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(@Param('username') username: string) {
    return this.profileService.getProfile(username);
  }

  @Auth()
  @Post(':username/follow')
  async followUser(
    @CurrentUser('id') currentUserId: number,
    @Param('username') username: string,
  ) {
    return this.profileService.followUser(currentUserId, username);
  }

  @Auth()
  @Delete(':username/follow')
  async unfollowUser(
    @CurrentUser('id') currentUserId: number,
    @Param('username') username: string,
  ) {
    return this.profileService.unfollowUser(currentUserId, username);
  }
}
