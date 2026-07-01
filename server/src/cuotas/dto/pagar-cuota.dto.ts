import { IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PagarCuotaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pagada?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaPago?: string;
}
