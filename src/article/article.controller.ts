import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { Auth, OptionalAuth } from 'src/user/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { DeleteResult } from 'typeorm';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { QueryDto } from './dto/query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseInterface } from './types/articleResponce.interface';
import { ArticlesResponseInterface } from './types/articlesResponce.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @OptionalAuth()
  @Get()
  async findAll(
    @User('id') currentUserId: number,
    @Query() query: QueryDto,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(currentUserId, query);
  }

  @Auth()
  @Post()
  async createArticle(
    @User() currentUser: UserEntity,
    @Body('article') dto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(currentUser, dto);
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticle(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticle(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Auth()
  @Delete(':slug')
  async deleteArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<DeleteResult> {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Auth()
  @Put(':slug')
  async updateArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
    @Body('article') dto: UpdateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(
      slug,
      dto,
      currentUserId,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Auth()
  @Post(':slug/favorite')
  async addToFavorites(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addToFavorites(
      currentUserId,
      slug,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Auth()
  @Delete(':slug/favorite')
  async deleteFromFavorites(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteFromFavorites(
      currentUserId,
      slug,
    );
    return this.articleService.buildArticleResponse(article);
  }
}
