import { IsIn, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarTipoPagoDto {
  @ApiProperty({ enum: ['contado', 'transferencia', 'cuotas'] })
  @IsIn(['contado', 'transferencia', 'cuotas'])
  tipoPago: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadCuotas?: number;
}
