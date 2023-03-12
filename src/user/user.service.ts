import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
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

  async login({ email, password }: LoginDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'username', 'image', 'bio'],
    });

    const isValidPassword = await compare(password, user.password);

    if (user && isValidPassword) {
      delete user.password;
      return user;
    }

    throw new UnauthorizedException('Invalid credentials');
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
