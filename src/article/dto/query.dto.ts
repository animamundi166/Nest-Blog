import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly tag: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly author: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly favorited: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  readonly limit: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  readonly offset: number;
}
