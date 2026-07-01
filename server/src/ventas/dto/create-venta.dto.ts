import { IsInt, IsString, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVentaDto {
  @ApiProperty()
  @IsInt()
  bonoId: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  numero: number;

  @ApiProperty()
  @IsInt()
  clubId: number;

  @ApiProperty()
  @IsString()
  compradorNombre: string;



  @ApiProperty()
  @IsString()
  @IsIn(['contado', 'transferencia', 'cuotas'])
  tipoPago: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadCuotas?: number;
}
