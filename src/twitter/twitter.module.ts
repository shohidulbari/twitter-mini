import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { TweetEntity } from './entity/tweet.entity';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([TweetEntity, UserEntity]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [TwitterController],
  providers: [TwitterService],
})
export class TwitterModule {}
