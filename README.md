## Description
Twitter Mini is a backend RESTful API project replicating some twitter functionality implemented with [NestJS](https://nestjs.com/) framework and [postgresql](https://www.postgresql.org/) database. 

## Installation
### Export necessary environment variable
Create a file ```.env``` at the root of the project directory following the sample provided in the file ```.env.example``` .  Samples are given below also,

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=twitter_mini_dev
POSTGRES_PASS=twitter_mini_dev
POSTGRES_DB=twitterdb
JWT_SECRET=HardToGuess
PORT=3000
```
### Install dependencies
```bash
$ npm install
```
### Build the app
```bash
$ npm run build
```
## Running the app
```bash
# development
$ npm run start
# watch mode
$ npm run start:dev
# production mode
$ npm run start:prod
```
## Swagger documentation page
After successfully running the app, we can visit the swagger documentaion page.
Page address is, ```<server_url>/api-docs```
For example, `http://localhost:3000/api-docs`
## Test
```bash
# unit tests
$ npm run test
# e2e tests
$ npm run test:e2e
```
