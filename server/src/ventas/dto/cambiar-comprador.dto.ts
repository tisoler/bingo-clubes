import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarCompradorDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  compradorNombre: string;
}
