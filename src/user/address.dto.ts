import { IsString } from 'class-validator';

class CreateAddressDto {
  @IsString()
  public street: string;
  @IsString()
  public city: string;
}

export default CreateAddressDto;
