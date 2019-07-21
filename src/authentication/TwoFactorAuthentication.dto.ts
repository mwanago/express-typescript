import { IsString } from 'class-validator';

class TwoFactorAuthenticationDto {
  @IsString()
  public twoFactorAuthenticationCode: string;
}

export default TwoFactorAuthenticationDto;
