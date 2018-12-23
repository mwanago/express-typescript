import { IsString } from 'class-validator';

class CreatePostDto {
  @IsString()
  public content: string;

  @IsString()
  public title: string;
}

export default CreatePostDto;
