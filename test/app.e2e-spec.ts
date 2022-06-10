import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserService } from '../src/user/user.service';
import { TwitterService } from '../src/twitter/twitter.service';
import * as chai from 'chai';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../src/user/entity/user.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let twitterService: TwitterService;
  let entityManager: EntityManager;
  let server: any;
  let user1: any;
  let user2: any;

  const reserve_user = {
    id: null,
    name: 'Shohidul Bari',
    email: 'test_e2e_100@gmail.com',
    password: '123456',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    expect(userService).toBeDefined();
    twitterService = moduleFixture.get<TwitterService>(TwitterService);
    expect(twitterService).toBeDefined();
    entityManager = moduleFixture.get<EntityManager>(EntityManager);
    expect(entityManager).toBeDefined();
    server = app.getHttpServer();
    expect(server).toBeDefined();
  });

  beforeEach(async () => {
    user1 = await userService.create({
      name: 'Shohidul Bari',
      email: 'test_e2e_1@gmail.com',
      password: '123456',
    });
    user2 = await userService.create({
      name: 'Shohidul Bari',
      email: 'test_e2e_2@gmail.com',
      password: '123456',
    });
  });

  afterEach(async () => {
    await entityManager.getRepository(UserEntity).delete(user1.id);
    await entityManager.getRepository(UserEntity).delete(user2.id);
    if (reserve_user.id)
      await entityManager.getRepository(UserEntity).delete(reserve_user.id);
    reserve_user.id = null;
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/user/create (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/create')
      .send({
        name: reserve_user.name,
        email: reserve_user.email,
        password: reserve_user.password,
      })
      .set('Accept', 'application/json');
    chai.expect(response.status).to.be.eql(201);
    reserve_user.id = response.body.data.id;
  });

  it('/user/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: user1.email,
        password: '123456',
      })
      .set('Accept', 'application/json');
    chai.expect(response.status).to.be.eql(200);
    chai.expect(response.body).to.have.property('data');
    chai.expect(response.body.data).to.have.property('accessToken');
  });

  it('/user/follow (POST)', async () => {
    const loginUser1 = await userService.login({
      email: user1.email,
      password: '123456',
    });
    const response = await request(app.getHttpServer())
      .post('/user/follow')
      .send({
        to: user2.id,
      })
      .set('Accept', 'application/json')
      .set('accessToken', loginUser1.accessToken);
    chai.expect(response.status).to.be.eql(201);
    chai.expect(response.body).to.have.property('data');
    chai.expect(response.body.data).to.have.property('status');
    chai.expect(response.body.data.status).to.be.eql('OK');
  });

  it('/twitter/tweet (POST)', async () => {
    const loginUser1 = await userService.login({
      email: user1.email,
      password: '123456',
    });
    const tweetBody = 'Hey, I am posting a tweet';
    const response = await request(app.getHttpServer())
      .post('/twitter/tweet')
      .send({
        body: tweetBody,
      })
      .set('Accept', 'application/json')
      .set('accessToken', loginUser1.accessToken);
    chai.expect(response.status).to.be.eql(201);
    chai.expect(response.body).to.have.property('data');
    chai.expect(response.body.data.body).to.be.eql(tweetBody);
  });

  it('/twitter/timeline (GET)', async () => {
    const loginUser2 = await userService.login({
      email: user2.email,
      password: '123456',
    });

    // user 2 publish 100 tweets
    const tweetBody = 'Test Tweet';
    for (let i = 0; i < 100; i++) {
      await twitterService.createNewTweet(
        {
          body: `${tweetBody} ${i}`,
        },
        user2.id,
      );
    }

    // get user 2 timeline
    const response = await request(app.getHttpServer())
      .get('/twitter/timeline?skip=0&limit=20')
      .set('Accept', 'application/json')
      .set('accessToken', loginUser2.accessToken);
    chai.expect(response.status).to.be.eql(200);
    chai.expect(response.body).to.have.property('data');
    chai.expect(response.body.data).to.be.an('array');
    chai.expect(response.body.data.length).to.be.eql(20);
    for (let i = 1; i < response.body.data.length; i++) {
      const firstTweetTime = new Date(response.body.data[i - 1].created_at);
      const secondtTweetTime = new Date(response.body.data[i].created_at);
      if (firstTweetTime.getTime() < secondtTweetTime.getTime()) {
        throw new Error('Order of the tweet is not maintained');
      }
    }
  });

  it('/twitter/newsfeed (GET)', async () => {
    const loginUser1 = await userService.login({
      email: user1.email,
      password: '123456',
    });

    // user 1 is following user 2
    const follow = await userService.follow(
      {
        to: user2.id,
      },
      user1.id,
    );
    chai.expect(follow).to.have.property('status');

    // user 1 publish 50 tweets
    const tweetBody = 'Test Tweet';
    for (let i = 0; i < 100; i++) {
      await twitterService.createNewTweet(
        {
          body: `${tweetBody} ${i}`,
        },
        user1.id,
      );
    }

    // user 2 publish 50 tweets
    for (let i = 0; i < 100; i++) {
      await twitterService.createNewTweet(
        {
          body: `${tweetBody} ${i}`,
        },
        user2.id,
      );
    }

    // get user 1 newsfeed
    const response = await request(app.getHttpServer())
      .get('/twitter/newsfeed?skip=0&limit=20')
      .set('Accept', 'application/json')
      .set('accessToken', loginUser1.accessToken);
    chai.expect(response.status).to.be.eql(200);
    chai.expect(response.body).to.have.property('data');
    chai.expect(response.body.data).to.be.an('array');
    chai.expect(response.body.data.length).to.be.eql(20);
    for (let i = 1; i < response.body.data.length; i++) {
      const firstTweetTime = new Date(response.body.data[i - 1].created_at);
      const secondtTweetTime = new Date(response.body.data[i].created_at);
      if (firstTweetTime.getTime() < secondtTweetTime.getTime()) {
        throw new Error('Order of the tweet is not maintained');
      }
      if (response.body.data[i].owner.id != user2.id) {
        console.log(response.body.data[i], user2.id);
        throw new Error('Wrong tweet returned by server');
      }
    }
  });
});
