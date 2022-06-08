import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { TweetEntity } from './entity/tweet.entity';

@Injectable()
export class TwitterService {
  constructor(
    @InjectRepository(TweetEntity)
    private tweetRepository: Repository<TweetEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createNewTweet(createTweetDto: CreateTweetDto, requesterId: number) {
    const userProfile = await this.userRepository.findOne({
      where: { id: requesterId },
    });
    const newTweet = new TweetEntity();
    newTweet.title = createTweetDto.title;
    newTweet.body = createTweetDto.body;
    newTweet.owner = userProfile;
    const dbResp = await this.tweetRepository.save(newTweet);
    return { id: dbResp.id };
  }

  async getTimeline(requesterId, skip, limit) {
    const tweets = await this.tweetRepository.find({
      where: { owner: requesterId },
      skip: skip,
      take: limit,
      order: {
        created_at: 'DESC',
      },
    });
    return tweets;
  }
}
