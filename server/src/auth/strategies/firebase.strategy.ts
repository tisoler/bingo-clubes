import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ExtractJwt } from 'passport-jwt';
import * as admin from 'firebase-admin';
import serviceAccount from '../../../firebase-service-account.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'bingo-clubes',
  });
}

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor() {
    super();
  }

  async validate(req: any): Promise<any> {
    const fn = ExtractJwt.fromAuthHeaderAsBearerToken();
    const token = fn(req);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      const uid = decodedUser.uid;

      const db = admin.firestore();
      const userDoc = await db.collection('usuarios').doc(uid).get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('Usuario no encontrado en el sistema');
      }

      const userData = userDoc.data()!;
      return {
        firebaseUid: uid,
        nombre: userData.nombre || '',
        email: userData.email || decodedUser.email,
        idClub: userData.idClub || null,
        rol: userData.rol || 'vendedor',
        roles: [userData.rol || 'vendedor'],
        actividad: userData.actividad || null,
      };
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Error al validar token de Firebase');
    }
  }
}
