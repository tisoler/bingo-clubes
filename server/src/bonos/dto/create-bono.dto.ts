import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBonoDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsNumber()
  @Min(2000)
  anio: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(12)
  mesInicial: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  montoCuota: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  montoContado: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  cantidadCuotas: number;
}
