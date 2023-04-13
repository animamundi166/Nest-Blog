import { Injectable } from '@nestjs/common';
import { UnprocessableEntityException } from '@nestjs/common/exceptions';
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
    const errorResponse = {
      errors: {},
    };

    const userByEmail = await this.userRepository.findOneBy({ email });
    const userByUsername = await this.userRepository.findOneBy({ username });

    if (userByEmail) {
      errorResponse.errors['email'] = 'Email or username are taken';
    }

    if (userByUsername) {
      errorResponse.errors['username'] = 'Email or username are taken';
    }

    if (userByEmail || userByUsername) {
      throw new UnprocessableEntityException(errorResponse);
    }

    const hashPassword = await hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      username,
      password: hashPassword,
    });
    return await this.userRepository.save(newUser);
  }

  async login({ email, password }: LoginDto): Promise<UserEntity> {
    const errorResponse = {
      errors: { email: 'Credentials are not valid' },
    };

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
      throw new UnprocessableEntityException(errorResponse);
    }

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new UnprocessableEntityException(errorResponse);
    }

    delete user.password;
    return user;
  }

  async updateUser(userId: number, dto: UpdateDto): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });
    return await this.userRepository.save({ ...user, ...dto });
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
