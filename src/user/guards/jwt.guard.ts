import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {}

export class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest(err, user) {
    return user;
  }
}
