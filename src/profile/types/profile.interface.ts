import { User } from '@prisma/client';

export type ProfileType = Omit<User, 'email' | 'password'>;
