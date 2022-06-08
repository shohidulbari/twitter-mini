import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [TwitterController],
  providers: [TwitterService],
})
export class TwitterModule {}
