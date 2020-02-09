import { Request, Response, Router } from 'express';
import Controller from '../interfaces/controller.interface';
import userModel from '../user/user.model';

class ReportController implements Controller {
  public path = '/report';
  public router = Router();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.generateReport);
  }

  private generateReport = async (request: Request, response: Response) => {
    const usersByCountries = await this.user.aggregate(
      [
        {
          $match: {
            'address.country': {
              $exists: true,
            },
          },
        },
        {
          $group: {
            _id: {
              country: '$address.country',
            },
            users: {
              $push: {
                _id: '$_id',
                name: '$name',
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'users._id',
            foreignField: 'author',
            as: 'articles',
          },
        },
        {
          $addFields: {
            amountOfArticles: {
              $size: '$articles',
            },
          },
        },
        {
          $sort: {
            amountOfArticles: 1,
          },
        },
      ],
    );
    response.send({
      usersByCountries,
    });
  }

}

export default ReportController;
