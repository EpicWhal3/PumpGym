import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "../../../common/enums/user-roles.enum";

export class CreateUserDto {
  @ApiProperty({ description: "Имя пользователя", example: "Иван Иванов" })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: "Email",
    example: "ivan@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Телефон",
    example: "+79991234567",
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 20)
  phone: string;

  @ApiProperty({
    description: "Роль пользователя",
    enum: UserRole,
    default: UserRole.USER,
    example: UserRole.USER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @ApiProperty({
    description: "Пароль",
    example: "securePassword123",
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 255)
  password: string;

  @ApiPropertyOptional({
    description: "URL аватара",
    example: "/uploads/users/ivan.jpg",
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: "Активен ли пользователь",
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
