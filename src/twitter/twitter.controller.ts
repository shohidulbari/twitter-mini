import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../user/auth.guard';
import { Request } from 'express';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { TwitterService } from './twitter.service';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';

@Controller('twitter')
@ApiTags('twitter')
@UseGuards(AuthGuard)
export class TwitterController {
  constructor(private twitterService: TwitterService) {}
  @Post('/tweet')
  @ApiHeader({ name: 'accessToken' })
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
  @ApiHeader({ name: 'accessToken' })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  async getTimeline(@Query() query: PaginationDto, @Req() request: Request) {
    let { skip, limit } = query;
    skip = parseInt(skip) || 0;
    limit = parseInt(limit) || 10;
    return await this.twitterService.getTimeline(
      request['requesterId'],
      skip,
      limit,
    );
  }

  @Get('/newsfeed')
  @ApiHeader({ name: 'accessToken' })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  async getNewsFeed(@Query() query: PaginationDto, @Req() request: Request) {
    let { skip, limit } = query;
    skip = parseInt(skip) || 0;
    limit = parseInt(limit) || 10;
    return await this.twitterService.getNewsFeed(
      request['requesterId'],
      skip,
      limit,
    );
  }
}
