import { IsString } from 'class-validator';

class CreatePostDto {
  @IsString()
  public author: string;

  @IsString()
  public content: string;

  @IsString()
  public title: string;
}

export default CreatePostDto;
