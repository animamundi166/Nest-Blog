import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register({ email, username, password }: RegisterDto) {
    const userByEmail = await this.prisma.user.findUnique({ where: { email } });
    const userByUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (userByEmail || userByUsername) {
      throw new UnprocessableEntityException('Email or username are taken');
    }

    const newUser = await this.prisma.user.create({
      data: { email, username, password: await hash(password) },
    });

    return this.exclude(newUser, ['password']);
  }

  private issueToken({ id }: User): string {
    return this.jwt.sign({ id });
  }

  private exclude<User, Key extends keyof User>(
    user: User,
    keys: Key[],
  ): Omit<User, Key> {
    for (const key of keys) {
      delete user[key];
    }
    return user;
  }

  buildUserResponse(user) {
    return {
      user: {
        ...user,
        token: this.issueToken(user),
      },
    };
  }
}
