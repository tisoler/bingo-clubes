import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BonoClubService } from './bono-club.service';

@ApiTags('bono-club')
@Controller('bono-club')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class BonoClubController {
  constructor(private readonly bonoClubService: BonoClubService) { }

  @Get('bono/:bonoId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin', 'vendedor')
  @ApiOperation({ summary: 'Obtener clubes asignados a un bono' })
  findByBono(@Param('bonoId') bonoId: string) {
    return this.bonoClubService.findByBono(+bonoId);
  }
}
