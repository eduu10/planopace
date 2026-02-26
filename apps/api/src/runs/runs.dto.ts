import { IsString, IsNumber, IsOptional, IsDateString, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRunDto {
  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiProperty()
  @IsNumber()
  distanceKm!: number;

  @ApiProperty()
  @IsInt()
  durationSeconds!: number;

  @ApiProperty()
  @IsNumber()
  paceAvg!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  paceMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  heartRateAvg?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  heartRateMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListRunsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  limit?: number;
}
