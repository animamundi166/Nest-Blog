import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../guards/jwt.guard';

export const Auth = () => UseGuards(JwtAuthGuard);
export const OptionalAuth = () => UseGuards(OptionalJwtAuthGuard);
