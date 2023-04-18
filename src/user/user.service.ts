import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register({ email, username, password }: RegisterDto) {
    const userByEmail = await this.findUserByEmail(email);
    const userByUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (userByEmail || userByUsername) {
      throw new UnprocessableEntityException('Email or username are taken');
    }

    const newUser = await this.prisma.user.create({
      data: { email, username, password: await hash(password) },
    });

    return this.buildUserResponse(newUser);
  }

  async login({ email, password }: LoginDto) {
    const userByEmail = await this.findUserByEmail(email);

    if (!userByEmail) {
      throw new UnprocessableEntityException('Credentials are not valid');
    }

    const isPasswordCorrect = await verify(userByEmail.password, password);

    if (!isPasswordCorrect) {
      throw new UnprocessableEntityException('Credentials are not valid');
    }

    return this.buildUserResponse(userByEmail);
  }

  private async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  private issueToken({ id }: User): string {
    return this.jwt.sign({ id });
  }

  buildUserResponse(user: User) {
    const data = {
      ...user,
      token: this.issueToken(user),
    };
    delete data.password;
    return {
      user: data,
    };
  }
}
