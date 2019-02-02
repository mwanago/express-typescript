import * as typeorm from 'typeorm';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import TokenData from '../interfaces/tokenData.interface';
import CreateUserDto from '../user/user.dto';
import AuthenticationService from './authentication.service';

(typeorm as any).getRepository = jest.fn();

describe('The AuthenticationService', () => {
  const authenticationService = new AuthenticationService();
  describe('when creating a cookie', () => {
    const tokenData: TokenData = {
      token: '',
      expiresIn: 1,
    };
    it('should return a string', () => {
      (typeorm as any).getRepository.mockImplementation(() => ({
        findOne: () => Promise.resolve(true),
      }));
      expect(typeof authenticationService.createCookie(tokenData))
        .toEqual('string');
    });
  });

  describe('when registering a user', () => {
    describe('if the email is already taken', () => {
      const userData: CreateUserDto = {
        fullName: 'John Smith',
        email: 'john@smith.com',
        password: 'strongPassword123',
      };
      (typeorm as any).getRepository.mockImplementation(() => ({
        findOne: () => Promise.resolve(userData),
      }));
      it('should throw an error', async () => {
        await expect(authenticationService.register(userData)).rejects
          .toMatchObject(new UserWithThatEmailAlreadyExistsException(userData.email));
      });
    });
  });

});
