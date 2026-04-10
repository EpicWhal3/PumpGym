import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Иван Иванов" })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: "ivan@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+79991234567" })
  @IsString()
  @IsNotEmpty()
  @Length(10, 20)
  phone: string;

  @ApiProperty({ example: "strongPassword123" })
  @IsString()
  @IsNotEmpty()
  @Length(6, 255)
  password: string;

  @ApiProperty({ required: false, example: "https://cdn.example.com/avatar.jpg" })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
