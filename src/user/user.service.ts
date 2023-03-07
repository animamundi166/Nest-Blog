import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from './entities/user.entity';
import { UserResponseInterface } from './types/userResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register({
    email,
    username,
    password,
  }: RegisterDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOneBy({ email });
    const userByUsername = await this.userRepository.findOneBy({ username });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hashPassword = await hash(password, 10);

    const newUser = new UserEntity();
    Object.assign(newUser, { email, username, password: hashPassword });
    return await this.userRepository.save(newUser);
  }

  issueToken({ email }: UserEntity): string {
    return this.jwtService.sign({ email });
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.issueToken(user),
      },
    };
  }
}
