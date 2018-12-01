import * as express from "express";

class PostsController {

  public path = '/posts';
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
  }

  getAllPosts(request: express.Request, response: express.Response) {
    response.send([
      {
        title: 'Lorem Ipsum',
        content: 'Dolor sit amet',
        author: 'Marcin',
      }
    ])
  }
}

export default PostsController;
