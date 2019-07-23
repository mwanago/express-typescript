import * as bcrypt from 'bcrypt';
import * as express from 'express';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import WrongAuthenticationTokenException from '../exceptions/WrongTwoFactorAuthenticationCodeException';
import Controller from '../interfaces/controller.interface';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import TokenData from '../interfaces/tokenData.interface';
import authMiddleware from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from '../user/user.dto';
import userModel from './../user/user.model';
import AuthenticationService from './authentication.service';
import LogInDto from './logIn.dto';
import TwoFactorAuthenticationDto from './TwoFactorAuthentication.dto';

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
    this.router.post(
      `${this.path}/2fa/turn-on`,
      validationMiddleware(TwoFactorAuthenticationDto),
      authMiddleware(),
      this.turnOnTwoFactorAuthentication,
    );
    this.router.post(
      `${this.path}/2fa/authenticate`,
      validationMiddleware(TwoFactorAuthenticationDto),
      authMiddleware(true),
      this.secondFactorAuthentication,
    );
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
    next: express.NextFunction,
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
      next(new WrongAuthenticationTokenException());
    }
  }

  private secondFactorAuthentication = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    const { twoFactorAuthenticationCode } = request.body;
    const user = request.user;
    console.log('user', user);
    const isCodeValid = await this.authenticationService.verifyTwoFactorAuthenticationCode(
      twoFactorAuthenticationCode, user,
    );
    if (isCodeValid) {
      const tokenData = this.authenticationService.createToken(user, true);
      response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
      response.send({
        ...user.toObject(),
        password: undefined,
        twoFactorAuthenticationCode: undefined
      });
    } else {
      next(new WrongAuthenticationTokenException());
    }
  }

  private loggingIn = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const logInData: LogInDto = request.body;
    const user = await this.user.findOne({ email: logInData.email });
    if (user) {
      const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
      if (isPasswordMatching) {
        user.password = undefined;
        user.twoFactorAuthenticationCode = undefined;
        const tokenData = this.authenticationService.createToken(user);
        response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
        if (user.isTwoFactorAuthenticationEnabled) {
          response.send({
            isTwoFactorAuthenticationEnabled: true,
          });
        } else {
          response.send(user);
        }
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  }

  private auth = (request: RequestWithUser, response: express.Response) => {
    response.send({
      ...request.user.toObject(),
      password: undefined,
      twoFactorAuthenticationCode: undefined
    });
  }

  private loggingOut = (request: express.Request, response: express.Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    response.send(200);
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }
}

export default AuthenticationController;
