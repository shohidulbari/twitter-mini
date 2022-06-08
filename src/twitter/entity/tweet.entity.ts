import { BaseEntity } from 'src/base.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'TWEETS' })
export class TweetEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  body: string;

  @ManyToOne(() => UserEntity, (user) => user.tweets)
  owner: UserEntity;
}
