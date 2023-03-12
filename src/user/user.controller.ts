import { Body, Controller, Get, Post, HttpCode } from '@nestjs/common';
import { Auth } from './decorators/auth.decorator';
import { User } from './decorators/user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from './entities/user.entity';
import { UserResponseInterface } from './types/userResponse.interface';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async register(
    @Body('user') dto: RegisterDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.register(dto);
    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @HttpCode(200)
  async login(@Body('user') dto: LoginDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(dto);
    return this.userService.buildUserResponse(user);
  }

  @Get('user')
  @Auth()
  async getCurrentUser(
    @User() user: UserEntity,
  ): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }
}
