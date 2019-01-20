import { IsString } from 'class-validator';

class CreateCategoryDto {
  @IsString()
  public name: string;
}

export default CreateCategoryDto;
