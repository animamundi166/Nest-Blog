import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tagList: string[];
}
