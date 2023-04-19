import { Body, Controller, HttpCode, Get, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { User } from '@prisma/client';
import { UpdateDto } from './dto/update.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async register(@Body('user') dto: RegisterDto) {
    return await this.userService.register(dto);
  }

  @Post('users/login')
  @HttpCode(200)
  async login(@Body('user') dto: LoginDto) {
    return await this.userService.login(dto);
  }

  @Auth()
  @Get('user')
  async getCurrentUser(@CurrentUser() currentUser: User) {
    return this.userService.buildUserResponse(currentUser);
  }

  @Auth()
  @Put('user')
  async updateUser(
    @CurrentUser() currentUser: User,
    @Body('user') dto: UpdateDto,
  ) {
    return await this.userService.updateUser(currentUser, dto);
  }
}
