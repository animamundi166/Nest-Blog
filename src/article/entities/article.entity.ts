import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentEntity } from './comment.entity';
import { TagEntity } from 'src/tag/entities/tag.entity';

@Entity('articles')
export class ArticleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  body: string;

  @ManyToMany(() => TagEntity, { cascade: true })
  @JoinTable({ name: 'article_tags' })
  tagList: TagEntity[];

  @Column({ default: 0, name: 'favorites_count' })
  favoritesCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (u) => u.articles, { eager: true })
  author: UserEntity;

  @OneToMany(() => CommentEntity, (c) => c.article)
  comments: CommentEntity[];
}
