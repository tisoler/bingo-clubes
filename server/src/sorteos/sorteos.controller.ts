import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SorteosService } from './sorteos.service';
import { CreateSorteoDto } from './dto/create-sorteo.dto';

@ApiTags('sorteos')
@Controller('sorteos')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class SorteosController {
  constructor(private readonly sorteosService: SorteosService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Crear un sorteo y determinar ganador' })
  create(@Body() createSorteoDto: CreateSorteoDto) {
    return this.sorteosService.create(createSorteoDto);
  }

  @Get('validar')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Validar si un número es ganador, vacante o inhabilitado' })
  validar(
    @Query('bonoId') bonoId: string,
    @Query('numero') numero: string,
    @Query('mes') mes: string,
  ) {
    return this.sorteosService.validar(+bonoId, +numero, +mes);
  }

  @Get()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Listar todos los sorteos' })
  findAll() {
    return this.sorteosService.findAll();
  }

  @Get(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Obtener detalle de un sorteo' })
  findOne(@Param('id') id: string) {
    return this.sorteosService.findOne(+id);
  }
}
