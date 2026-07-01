import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { CuotasService } from './cuotas.service';
import { PagarCuotaDto } from './dto/pagar-cuota.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('cuotas')
@Controller()
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class CuotasController {
  constructor(private readonly cuotasService: CuotasService) { }

  @Get('ventas/:ventaId/cuotas')
  @ApiOperation({ summary: 'Listar cuotas de una venta' })
  findByVenta(@Param('ventaId') ventaId: string) {
    return this.cuotasService.findByVenta(+ventaId);
  }

  @Patch('cuotas/:id/pagar')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Marcar/desmarcar cuota como pagada' })
  pagar(@Param('id') id: string, @Body() pagarCuotaDto: PagarCuotaDto) {
    return this.cuotasService.pagar(+id, pagarCuotaDto);
  }
}
