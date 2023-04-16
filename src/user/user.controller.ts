import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async register(@Body('user') dto: RegisterDto) {
    const user = await this.userService.register(dto);
    return this.userService.buildUserResponse(user);
  }
}
