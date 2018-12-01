import * as express from "express";
import * as bodyParser from "body-parser";

class App {
  public app: express.Application;

  port: number;

  constructor(controllers, port) {
    this.app = express();
    this.port = port;
    this.initializeControllers(controllers);
    this.config();
  }

  initializeControllers(controllers) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router);
    })
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    })
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({extended: false}));
  }

}

export default App;
