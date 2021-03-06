import { BaseEntity } from '../../base.entity';
import { TweetEntity } from '../../twitter/entity/tweet.entity';
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

  @OneToMany(() => TweetEntity, (tweets) => tweets.owner, { cascade: true })
  tweets: TweetEntity[];

  @ManyToMany(() => UserEntity, { cascade: true })
  @JoinTable()
  following: UserEntity[];

  @ManyToMany(() => UserEntity, { cascade: true })
  @JoinTable()
  followers: UserEntity[];
}
