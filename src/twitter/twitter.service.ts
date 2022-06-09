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
    newTweet.body = createTweetDto.body;
    newTweet.owner = userProfile;
    const dbResp = await this.tweetRepository.save(newTweet);
    return { id: dbResp.id };
  }

  async getTimeline(requesterId, skip, limit) {
    const tweets = await this.tweetRepository
      .createQueryBuilder('tweet')
      .innerJoin('tweet.owner', 'owner')
      .where('owner.id = :requesterId', { requesterId })
      .orderBy('tweet.created_at', 'DESC')
      .skip(skip)
      .limit(limit)
      .getMany();
    return tweets;
  }

  async getNewsFeed(requesterId, skip, limit) {
    const tweets = await this.tweetRepository
      .createQueryBuilder('tweet')
      .innerJoin('tweet.owner', 'owner')
      .innerJoin('owner.followers', 'followers')
      .where('followers.id = :requesterId', { requesterId })
      .orderBy('tweet.created_at', 'DESC')
      .skip(skip)
      .limit(limit)
      .getMany();
    return tweets;
  }
}
