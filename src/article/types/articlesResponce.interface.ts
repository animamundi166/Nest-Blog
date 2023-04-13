import { articleWithArrayOfStringsInTagList } from './articleWithArrayOfStringsInTagList.interface';

export interface ArticlesResponseInterface {
  articles: articleWithArrayOfStringsInTagList[];
  articlesCount: number;
}
