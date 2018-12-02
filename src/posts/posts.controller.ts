import * as express from 'express';
import Post from './post.interface';

class PostsController {
  public path = '/posts';
  public router = express.Router();

  private posts: Post[] = [
    {
      author: 'Marcin',
      content: 'Dolor sit amet',
      title: 'Lorem Ipsum',
    },
  ];

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.post(this.path, this.createAPost);
  }

  public getAllPosts = (request: express.Request, response: express.Response) => {
    response.send(this.posts);
  }

  public createAPost = (request: express.Request, response: express.Response) => {
    const post: Post = request.body;
    this.posts.push(post);
    response.send(post);
  }
}

export default PostsController;
