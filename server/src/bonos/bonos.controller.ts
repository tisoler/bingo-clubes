import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BonosService } from './bonos.service';
import { CreateBonoDto } from './dto/create-bono.dto';

@ApiTags('bonos')
@Controller('bonos')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class BonosController {
  constructor(private readonly bonosService: BonosService) { }

  @Get()
  @ApiOperation({ summary: 'Listar bonos activos' })
  findAll(@Req() req) {
    const user = req.user;
    return this.bonosService.findAll(user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Crear un bono' })
  create(@Body() createBonoDto: CreateBonoDto) {
    return this.bonosService.create(createBonoDto);
  }
}
