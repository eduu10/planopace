import { IsString, IsOptional, IsInt, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100)
  age?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  experienceYears?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  currentPace?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  goalType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  goalValue?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  weeklyDays?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  maxHr?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  restHr?: number;
}
