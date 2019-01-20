import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Post from '../post/post.entity';
import Address from './address.entity';

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

  @OneToOne(() => Address, (address: Address) => address.user, {
    cascade: true,
  })
  @JoinColumn()
  public address: Address;
}

export default User;
