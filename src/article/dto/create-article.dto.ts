import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  readonly body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tagList: string[];
}
