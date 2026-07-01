import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseGuard } from './guards/firebase.guard';
import * as admin from 'firebase-admin';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(FirebaseGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async register(@Body() body: { email: string; nombre: string }) {
    const { email, nombre } = body;

    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch {
      return { success: false, message: 'Primero debes crear la cuenta en Firebase Authentication.' };
    }

    const db = admin.firestore();
    const userRef = db.collection('usuarios').doc(userRecord.uid);
    const snap = await userRef.get();

    if (snap.exists) {
      return { success: false, message: 'El usuario ya está registrado en el sistema.' };
    }

    await userRef.set({
      nombre,
      email,
      idClub: null,
      rol: 'vendedor',
      actividad: null,
    });

    return { success: true, message: 'Registro completado. Revisa tu correo para verificar tu cuenta.' };
  }
}
