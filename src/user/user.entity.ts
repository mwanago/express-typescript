import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Post from '../post/post.entity';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public name: string;

  @Column()
  public email: string;

  @Column()
  public password: string;

  @OneToMany(() => Post, (post: Post) => post.author)
  @JoinColumn()
  public posts: Post[];
}

export default User;
