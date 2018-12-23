import { IsString } from 'class-validator';

class CreateUserDto {
  @IsString()
  public name: string;

  @IsString()
  public email: string;

  @IsString()
  public password: string;
}

export default CreateUserDto;
