import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RegisterDto } from './register.dto';

export class UpdateDto extends PartialType(RegisterDto) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly image: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly bio: string;
}
