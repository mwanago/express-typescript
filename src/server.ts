import 'dotenv/config';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import AddressController from './address/address.controller';
import App from './app';
import AuthenticationController from './authentication/authentication.controller';
import CategoryController from './category/category.controller';
import * as config from './ormconfig';
import PostController from './post/post.controller';
import validateEnv from './utils/validateEnv';

validateEnv();

(async () => {
  try {
    const connection = await createConnection(config);
    await connection.runMigrations();
  } catch (error) {
    console.log('Error while connecting to the database', error);
    return error;
  }
  const app = new App(
    [
      new PostController(),
      new AuthenticationController(),
      new AddressController(),
      new CategoryController(),
    ],
  );
  app.listen();
})();
