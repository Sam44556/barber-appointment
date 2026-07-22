import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from '../../lib/auth';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log('🔐 AuthGuard: Starting validation...');
    console.log('🔐 Token present:', !!token);
    console.log('🔐 Token preview:', token ? `${token.substring(0, 10)}...` : 'none');

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      console.log('🔐 AuthGuard: Calling Better Auth getSession...');
      
      const session = await auth.api.getSession({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      console.log('🔐 Better Auth session response:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        sessionKeys: session ? Object.keys(session) : [],
        userKeys: session?.user ? Object.keys(session.user) : [],
      });

      if (!session) {
        console.log('❌ AuthGuard: No session returned from Better Auth');
        throw new UnauthorizedException('No session found');
      }

      if (!session.user) {
        console.log('❌ AuthGuard: No user in session');
        throw new UnauthorizedException('No user in session');
      }

      console.log('✅ AuthGuard: Session valid for user:', session.user.id);

      // Fetch the full user data with role from database
      const fullUser = await this.prismaService.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!fullUser) {
        console.log('❌ AuthGuard: User not found in database');
        throw new UnauthorizedException('User not found');
      }

      console.log('✅ AuthGuard: User loaded with role:', fullUser.role);

      // Attach both session and full user data to request
      request.user = fullUser;
      request.session = session.session;
      return true;
      
    } catch (error) {
      console.error('❌ AuthGuard Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0],
      });
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
