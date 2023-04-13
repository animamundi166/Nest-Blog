import { ArticleEntity } from '../entities/article.entity';

export interface articleWithArrayOfStringsInTagList
  extends Omit<ArticleEntity, 'tagList'> {
  tagList: string[];
}
