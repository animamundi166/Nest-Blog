import { Controller, Post, Body } from '@nestjs/common';
import { Auth } from 'src/user/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponce.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Auth()
  @Post()
  async create(
    @User() currentUser: UserEntity,
    @Body('article') dto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(currentUser, dto);
    return this.articleService.buildArticleResponse(article);
  }
}
