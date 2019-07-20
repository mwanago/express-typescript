interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  twoFactorAuthenticationCode: string;
  isTwoFactorAuthenticationEnabled: boolean;
  address?: {
    street: string,
    city: string,
  };
}

export default User;
