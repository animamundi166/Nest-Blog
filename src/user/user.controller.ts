import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async register(
    @Body('user') dto: RegisterDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.register(dto);
    return await this.userService.buildUserResponse(user);
  }
}
