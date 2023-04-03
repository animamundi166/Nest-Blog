import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArticleEntity } from './article.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column()
  body: string;

  @ManyToOne(() => UserEntity, (u) => u.articles, { eager: true })
  author: UserEntity;

  @ManyToOne(() => ArticleEntity, (a) => a.comments)
  article: ArticleEntity;
}
