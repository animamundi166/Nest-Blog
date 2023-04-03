import { ArticleEntity } from 'src/article/entities/article.entity';
import { CommentEntity } from 'src/article/entities/comment.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  image: string;

  @Column({ select: false })
  password: string;

  @OneToMany(() => ArticleEntity, (a) => a.author)
  articles: ArticleEntity[];

  @OneToMany(() => CommentEntity, (c) => c.author)
  comments: CommentEntity[];

  @ManyToMany(() => ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[];
}
