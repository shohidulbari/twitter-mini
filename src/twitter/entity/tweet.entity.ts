import { BaseEntity } from '../../base.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'TWEETS' })
export class TweetEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @ManyToOne(() => UserEntity, (user) => user.tweets, { onDelete: 'CASCADE' })
  owner: UserEntity;
}
