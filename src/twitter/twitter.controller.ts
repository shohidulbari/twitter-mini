import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/user/auth.guard';
import { Request } from 'express';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { TwitterService } from './twitter.service';

@Controller('twitter')
@UseGuards(AuthGuard)
export class TwitterController {
  constructor(private twitterService: TwitterService) {}
  @Post('/tweet')
  async createNewTweet(
    @Body() createTweetDto: CreateTweetDto,
    @Req() request: Request,
  ) {
    return await this.twitterService.createNewTweet(
      createTweetDto,
      request['requesterId'],
    );
  }

  @Get('/timeline')
  async getTimeline(@Query() query, @Req() request: Request) {
    let { skip, limit } = query;
    skip = parseInt(skip) || 0;
    limit = parseInt(limit) || 10;
    return await this.twitterService.getTimeline(
      request['requesterId'],
      skip,
      limit,
    );
  }
}
