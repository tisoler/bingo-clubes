import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FirebaseStrategy } from './strategies/firebase.strategy';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [FirebaseStrategy],
  exports: [FirebaseStrategy],
})
export class AuthModule {}
