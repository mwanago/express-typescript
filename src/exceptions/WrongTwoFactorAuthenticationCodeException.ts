
import HttpException from './HttpException';

class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(400, 'Wrong two factor authentication token');
  }
}

export default WrongAuthenticationTokenException;
