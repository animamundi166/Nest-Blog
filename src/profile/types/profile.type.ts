import { UserEntity } from 'src/user/entities/user.entity';

export type ProfileType = UserEntity & { following: boolean };
