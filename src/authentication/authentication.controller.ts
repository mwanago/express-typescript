import * as bcrypt from 'bcrypt';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import Controller from '../interfaces/controller.interface';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import TokenData from '../interfaces/tokenData.interface';
import authMiddleware from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from '../user/user.dto';
import User from '../user/user.interface';
import userModel from './../user/user.model';
import AuthenticationService from './authentication.service';
import LogInDto from './logIn.dto';

class AuthenticationController implements Controller {
  public path = '/auth';
  public router = express.Router();
  public authenticationService = new AuthenticationService();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
    this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
    this.router.post(`${this.path}/logout`, this.loggingOut);
    this.router.get(`${this.path}`, authMiddleware(), this.auth);
    this.router.post(`${this.path}/2fa/generate`, authMiddleware(), this.generateTwoFactorAuthenticationCode);
    this.router.post(`${this.path}/2fa/turn-on`, authMiddleware(), this.turnOnTwoFactorAuthentication);
    this.router.post(`${this.path}/2fa/authenticate`, authMiddleware(true), this.secondFactorAuthentication);
  }

  private registration = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const userData: CreateUserDto = request.body;
    try {
      const {
        cookie,
        user,
      } = await this.authenticationService.register(userData);
      response.setHeader('Set-Cookie', [cookie]);
      response.send(user);
    } catch (error) {
      next(error);
    }
  }

  private generateTwoFactorAuthenticationCode = async (
    request: RequestWithUser,
    response: express.Response,
  ) => {
    const user = request.user;
    const {
      otpauthUrl,
      base32,
    } = this.authenticationService.getTwoFactorAuthenticationCode();
    await this.user.findByIdAndUpdate(user._id, {
      twoFactorAuthenticationCode: base32,
    });
    this.authenticationService.respondWithQRCode(otpauthUrl, response);
  }

  private turnOnTwoFactorAuthentication = async (
    request: RequestWithUser,
    response: express.Response,
  ) => {
    const { twoFactorAuthenticationCode } = request.body;
    const user = request.user;
    const isCodeValid = await this.authenticationService.verifyTwoFactorAuthenticationCode(
      twoFactorAuthenticationCode, user,
    );
    if (isCodeValid) {
      await this.user.findByIdAndUpdate(user._id, {
        isTwoFactorAuthenticationEnabled: true,
      });
      response.send(200);
    } else {
      response.send(400);
    }
  }

  private secondFactorAuthentication = async (
    request: RequestWithUser,
    response: express.Response,
  ) => {
    const { twoFactorAuthenticationCode } = request.body;
    const user = request.user;
    const isCodeValid = await this.authenticationService.verifyTwoFactorAuthenticationCode(
      twoFactorAuthenticationCode, user,
    );
    if (isCodeValid) {
      const tokenData = this.createToken(user, true);
      response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
      response.send(user);
    } else {
      response.send(400);
    }
  }

  private loggingIn = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const logInData: LogInDto = request.body;
    const user = await this.user.findOne({ email: logInData.email });
    if (user) {
      const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
      if (isPasswordMatching) {
        user.password = undefined;
        const tokenData = this.createToken(user);
        response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  }

  private auth = (request: RequestWithUser, response: express.Response) => {
    response.send(request.user);
  }

  private loggingOut = (request: express.Request, response: express.Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    response.send(200);
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  private createToken(user: User, isSecondFactorAuthenticated = false): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      isSecondFactorAuthenticated,
      _id: user._id,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

}

export default AuthenticationController;
