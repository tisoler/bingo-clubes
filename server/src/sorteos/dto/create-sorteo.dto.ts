import { IsInt, IsString, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSorteoDto {
  @ApiProperty()
  @IsInt()
  bonoId: number;

  @ApiProperty()
  @IsDateString()
  fechaSorteo: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @ApiProperty()
  @IsString()
  premio: string;

  @ApiProperty()
  @IsInt()
  numeroGanador: number;
}
