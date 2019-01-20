import * as express from 'express';
import { getRepository } from 'typeorm';
import CategoryNotFoundException from '../exceptions/CategoryNotFoundException';
import Controller from '../interfaces/controller.interface';
import validationMiddleware from '../middleware/validation.middleware';
import CreateCategoryDto from './category.dto';
import Category from './category.entity';

class CategoryController implements Controller {
  public path = '/categories';
  public router = express.Router();
  private categoryRepository = getRepository(Category);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllCategories);
    this.router.get(`${this.path}/:id`, this.getCategoryById);
    this.router.post(this.path, validationMiddleware(CreateCategoryDto), this.createCategory);
  }

  private getAllCategories = async (request: express.Request, response: express.Response) => {
    const categories = await this.categoryRepository.find({ relations: ['posts'] });
    response.send(categories);
  }

  private getCategoryById = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const id = request.params.id;
    const category = await this.categoryRepository.findOne(id, { relations: ['posts'] });
    if (category) {
      response.send(category);
    } else {
      next(new CategoryNotFoundException(id));
    }
  }

  private createCategory = async (request: express.Request, response: express.Response) => {
    const categoryData: CreateCategoryDto = request.body;
    const newCategory = this.categoryRepository.create(categoryData);
    await this.categoryRepository.save(newCategory);
    response.send(newCategory);
  }
}

export default CategoryController;
