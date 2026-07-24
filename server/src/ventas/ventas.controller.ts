import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { CambiarTipoPagoDto } from './dto/cambiar-tipo-pago.dto';
import { CambiarCompradorDto } from './dto/cambiar-comprador.dto';
import { VentasFilterDto } from './dto/ventas-filter.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('ventas')
@Controller('ventas')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class VentasController {
  constructor(private readonly ventasService: VentasService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una venta' })
  create(@Body() createVentaDto: CreateVentaDto, @Req() req) {
    return this.ventasService.create(createVentaDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas con filtros' })
  findAll(@Query() filter: VentasFilterDto, @Req() req) {
    const user = req.user;
    return this.ventasService.findAll(filter, user);
  }

  @Patch(':id/tipo-pago')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Cambiar tipo de pago de una venta' })
  cambiarTipoPago(@Param('id') id: string, @Body() dto: CambiarTipoPagoDto) {
    return this.ventasService.cambiarTipoPago(+id, dto);
  }

  @Patch(':id/comprador')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Cambiar nombre del comprador' })
  cambiarComprador(@Param('id') id: string, @Body() dto: CambiarCompradorDto) {
    return this.ventasService.cambiarComprador(+id, dto.compradorNombre);
  }

  @Patch(':id/verificar-pago')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Verificar pago de una venta' })
  verificarPago(@Param('id') id: string) {
    return this.ventasService.verificarPago(+id);
  }

  @Get('disponibles/:bonoId/:clubId')
  @ApiOperation({ summary: 'Números disponibles para un bono y club' })
  disponibles(@Param('bonoId') bonoId: string, @Param('clubId') clubId: string) {
    return this.ventasService.getDisponibles(+bonoId, +clubId);
  }

  @Get('bono/:bonoId/club/:clubId/numeros')
  @ApiOperation({ summary: 'Listar ventas de un bono y club' })
  vendidos(@Param('bonoId') bonoId: string, @Param('clubId') clubId: string) {
    return this.ventasService.getVendidos(+bonoId, +clubId);
  }
}
