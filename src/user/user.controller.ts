import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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
  async login(@Body('user') dto: LoginDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(dto);
    return this.userService.buildUserResponse(user);
  }
}
