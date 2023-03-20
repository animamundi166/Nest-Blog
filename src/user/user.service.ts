import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
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
      select: {
        id: true,
        email: true,
        password: true,
        username: true,
        image: true,
        bio: true,
      },
    });

    if (!user) {
      throw new HttpException(
        'Credentials are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Credentials are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    delete user.password;
    return user;
  }

  async updateUser(userId: number, dto: UpdateDto): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });
    Object.assign(user, dto);
    return await this.userRepository.save(user);
  }

  issueToken({ id }: UserEntity): string {
    return this.jwtService.sign({ id });
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
