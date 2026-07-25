import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log('🔐 AuthGuard: Starting validation...');
    console.log('🔐 Token present:', !!token);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      console.log('🔐 AuthGuard: Calling AuthService getSession...');
      
      // Use our custom auth service instead of Better Auth directly
      const sessionData = await this.authService.getSession(token);

      if (!sessionData || !sessionData.user) {
        console.log('❌ AuthGuard: No session or user from AuthService');
        throw new UnauthorizedException('Invalid session');
      }

      console.log('✅ AuthGuard: Session valid for user:', sessionData.user.id, 'role:', sessionData.user.role);

      // Attach session and user data to request
      request.user = sessionData.user;
      request.session = sessionData.session;
      return true;
      
    } catch (error) {
      console.error('❌ AuthGuard Error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
