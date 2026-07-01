import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { ClubesService } from './clubes.service';

@ApiTags('clubes')
@Controller('clubes')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los clubes' })
  findAll() {
    return this.clubesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un club por ID' })
  findOne(@Param('id') id: string) {
    return this.clubesService.findOne(+id);
  }
}
