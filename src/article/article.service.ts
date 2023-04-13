import { Injectable } from '@nestjs/common';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { UserEntity } from 'src/user/entities/user.entity';
import { DeleteResult, In, Repository } from 'typeorm';
import { ArticleEntity } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { QueryDto } from './dto/query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseInterface } from './types/articleResponce.interface';
import { FollowEntity } from 'src/profile/entities/profile.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { CommentResponseInterface } from './types/commentResponce.interface';
import { TagEntity } from 'src/tag/entities/tag.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async findAll(currentUserId: number, query: QueryDto) {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');
    queryBuilder.limit(query.limit || 20);
    queryBuilder.offset(query.offset || 0);

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList ILIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOneBy({
        username: query.author,
      });

      if (!author) {
        throw new NotFoundException("Author doesn't exist");
      }

      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: { favorites: true },
      });

      if (!author) {
        throw new NotFoundException("Author doesn't exist");
      }

      const ids = author.favorites.map((favorite) => favorite.id);
      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    let favoriteIds: number[] = [];
    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: { favorites: true },
      });
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }

    const [articles, articlesCount] = await queryBuilder.getManyAndCount();

    const articlesWithFavorites = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorites, articlesCount };
  }

  async getFeed(currentUserId: number, query: QueryDto) {
    const follows = this.followRepository.find({
      where: { followerId: currentUserId },
    });

    if ((await follows).length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = (await follows).map(
      (follow) => follow.followingId,
    );

    const feedPosts = await this.articleRepository.find({
      where: { author: In(followingUserIds) },
      order: { updatedAt: 'DESC' },
      take: query.limit || 20,
      skip: query.offset || 0,
    });

    return { articles: feedPosts, articlesCount: feedPosts.length };
  }

  async createArticle(
    currentUser: UserEntity,
    dto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const tags = await Promise.all(
      dto.tagList.map((tag) => this.preloadTagByName(tag)),
    );
    const article = this.articleRepository.create({
      ...dto,
      tagList: tags,
      slug: this.getSlug(dto.title),
      author: currentUser,
    });
    return await this.articleRepository.save(article);
  }

  async addToFavorites(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.getArticle(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: { favorites: true },
    });

    const isFavorited = user.favorites.some(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (!isFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }

  async deleteFromFavorites(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.getArticle(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: { favorites: true },
    });

    const acticleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (acticleIndex >= 0) {
      user.favorites.splice(acticleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    if (article.tagList?.length > 0) {
      const tagListName = article.tagList.map((tag) => tag.name);
      return { article: { ...article, tagList: tagListName } };
    }
    return { article: { ...article, tagList: [] } };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }

  private async preloadTagByName(name: string): Promise<TagEntity> {
    const existingTag = await this.tagRepository.findOneBy({ name });
    if (existingTag) {
      return existingTag;
    }
    return this.tagRepository.create({ name });
  }

  async getArticle(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOneBy({ slug });
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.getArticle(slug);

    if (!article) {
      throw new NotFoundException("Article doesn't exist");
    }

    if (article.author.id !== currentUserId) {
      throw new ForbiddenException('You are not an author');
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string,
    dto: UpdateArticleDto,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticle(slug);

    if (!article) {
      throw new NotFoundException("Article doesn't exist");
    }

    if (article.author.id !== currentUserId) {
      throw new ForbiddenException('You are not an author');
    }

    const tags =
      dto.tagList &&
      (await Promise.all(dto.tagList.map((tag) => this.preloadTagByName(tag))));

    return await this.articleRepository.save({
      ...article,
      ...dto,
      tagList: tags,
    });
  }

  async addComment(
    currentUser: UserEntity,
    dto: CreateCommentDto,
    slug: string,
  ): Promise<CommentEntity> {
    const article = await this.getArticle(slug);

    if (!article) {
      throw new NotFoundException("Article doesn't exist");
    }
    const comment = this.commentRepository.create({
      ...dto,
      author: currentUser,
      article,
    });

    return await this.commentRepository.save(comment);
  }

  async getComments(currentUserId: number, slug: string) {
    const article = await this.getArticle(slug);

    if (!article) {
      throw new NotFoundException("Article doesn't exist");
    }

    const comments = await this.commentRepository.find({
      where: {
        article: { id: article.id },
      },
      order: { createdAt: 'DESC' },
    });

    if (currentUserId === undefined) {
      return comments.map((comment) => ({
        ...comment,
        author: { ...comment.author, following: false },
      }));
    }

    if (currentUserId) {
      const follows = await this.followRepository.find({
        where: {
          followerId: currentUserId,
        },
      });

      const followingIds = follows.map((follow) => follow.followingId);

      const articlesWithFollowing = comments.map((comment) => {
        const following = followingIds.includes(comment.author.id);
        return {
          ...comment,
          author: { ...comment.author, following },
        };
      });

      return articlesWithFollowing;
    }
  }

  async deleteComment(
    currentUserId: number,
    slug: string,
    id: number,
  ): Promise<DeleteResult> {
    const article = await this.getArticle(slug);

    if (!article) {
      throw new NotFoundException("Article doesn't exist");
    }

    const comment = await this.commentRepository.findOneBy({ id });

    if (!comment) {
      throw new NotFoundException("Comment doesn't exist");
    }

    if (comment.author.id !== currentUserId) {
      throw new ForbiddenException('You are not an author');
    }

    return await this.commentRepository.delete(comment.id);
  }

  buildCommentResponse(comment: CommentEntity): CommentResponseInterface {
    delete comment.article;
    return { comment };
  }
}
