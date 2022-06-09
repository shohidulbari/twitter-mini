import { BaseEntity } from 'src/base.entity';
import { TweetEntity } from 'src/twitter/entity/tweet.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity({ name: 'USERS' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => TweetEntity, (tweets) => tweets.owner)
  tweets: TweetEntity[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
  following: UserEntity[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
  followers: UserEntity[];
}
