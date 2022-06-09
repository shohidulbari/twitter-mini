import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entity/user.entity';
import { UserModule } from '../user/user.module';
import { TweetEntity } from './entity/tweet.entity';
import { TwitterModule } from './twitter.module';
import { TwitterService } from './twitter.service';
import { EntityManager } from 'typeorm';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as chai from 'chai';

describe('TwitterService', () => {
  let twitterService: TwitterService;
  let userService: UserService;

  let entityManager: EntityManager;
  let user1: any;
  let user2: any;

  const user_sample_1: CreateUserDto = {
    name: 'Test User 1',
    email: 't101@gmail.com',
    password: '123456',
  };

  const user_sample_2: CreateUserDto = {
    name: 'Test User 1',
    email: 't102@gmail.com',
    password: '123456',
  };

  const user_1_tweets = [
    'Oldest tweet from user 1',
    'Old tweet from user 1',
    'New tweet from user 1',
  ];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASS,
          database: process.env.POSTGRES_DB,
          entities: [UserEntity, TweetEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([UserEntity, TweetEntity]),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
        UserModule,
        TwitterModule,
      ],
      providers: [TwitterService, UserService],
    }).compile();

    twitterService = module.get<TwitterService>(TwitterService);
    userService = module.get<UserService>(UserService);
    entityManager = module.get<EntityManager>(EntityManager);

    // insert test users
    user1 = await userService.create(user_sample_1);
    user2 = await userService.create(user_sample_2);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(twitterService).toBeDefined();
  });

  it('Should create a new tweet from user1', async () => {
    const resp = await twitterService.createNewTweet(
      {
        body: user_1_tweets[0],
      },
      user1.id,
    );
    chai.expect(resp.id).to.be.a('number');
    chai.expect(resp.body).to.be.eql(user_1_tweets[0]);
    await entityManager.getRepository(TweetEntity).delete(resp.id);
  });

  it('Should return the timeline of user1', async () => {
    // create some tweets
    for (let i = 0; i < user_1_tweets.length; i++) {
      await twitterService.createNewTweet(
        {
          body: user_1_tweets[i],
        },
        user1.id,
      );
    }
    // without pagination
    let timeline = await twitterService.getTimeline(user1.id, 0, 10);
    chai.expect(timeline).to.be.an('array');
    chai.expect(timeline.length).to.be.eql(3);
    chai.expect(timeline[0].body).to.be.eql(user_1_tweets[2]);
    chai.expect(timeline[1].body).to.be.eql(user_1_tweets[1]);
    chai.expect(timeline[2].body).to.be.eql(user_1_tweets[0]);

    // with pagination skip 1 limit 2
    timeline = await twitterService.getTimeline(user1.id, 1, 3);
    chai.expect(timeline).to.be.an('array');
    chai.expect(timeline.length).to.be.eql(2);
    chai.expect(timeline[0].body).to.be.eql(user_1_tweets[1]);
    chai.expect(timeline[1].body).to.be.eql(user_1_tweets[0]);
  });

  it('Should return the newsfeed of user2', async () => {
    // create some tweets
    for (let i = 0; i < user_1_tweets.length; i++) {
      await twitterService.createNewTweet(
        {
          body: user_1_tweets[i],
        },
        user1.id,
      );
    }

    // user2 starts following user1
    const resp = await userService.follow(
      {
        to: user1.id,
      },
      user2.id,
    );
    chai.expect(resp.status).to.be.eql('OK');

    // get user2 newsfeed
    let newsfeed = await twitterService.getNewsFeed(user2.id, 0, 10);
    chai.expect(newsfeed.length).to.be.eql(3);
    chai.expect(newsfeed[0].body).to.be.eql(user_1_tweets[2]);
    chai.expect(newsfeed[1].body).to.be.eql(user_1_tweets[1]);
    chai.expect(newsfeed[2].body).to.be.eql(user_1_tweets[0]);

    // newsfeed with pagination
    newsfeed = await twitterService.getNewsFeed(user2.id, 1, 3);
    chai.expect(newsfeed).to.be.an('array');
    chai.expect(newsfeed.length).to.be.eql(2);
    chai.expect(newsfeed[0].body).to.be.eql(user_1_tweets[1]);
    chai.expect(newsfeed[1].body).to.be.eql(user_1_tweets[0]);
  });

  afterEach(async () => {
    await entityManager.getRepository(TweetEntity).clear();
  });

  afterAll(async () => {
    await entityManager.getRepository(UserEntity).delete(user1.id);
    await entityManager.getRepository(UserEntity).delete(user2.id);
  });
});
