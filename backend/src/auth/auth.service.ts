import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { auth } from '../lib/auth';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      console.log('Attempting signup with data:', { 
        email: signUpDto.email, 
        name: signUpDto.name,
        hasPhone: !!signUpDto.phone 
      });

      const result = await auth.api.signUpEmail({
        body: {
          email: signUpDto.email,
          password: signUpDto.password,
          name: signUpDto.name,
          ...(signUpDto.phone && { phone: signUpDto.phone }),
        },
      });

      console.log('Signup result:', result);

      // Fetch the full user data with role
      const fullUser = await this.prismaService.user.findUnique({
        where: { id: result.user.id },
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

      return {
        user: fullUser,
        token: result.token,
      };
    } catch (error) {
      console.error('SignUp Error Details:');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', error);
      
      if (error.message?.includes('already exists')) {
        throw new ConflictException('User with this email already exists');
      }
      throw new Error(`Signup failed: ${error.message || 'Unknown error'}`);
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      console.log('🔍 SignIn attempt for:', signInDto.email);
      
      const result = await auth.api.signInEmail({
        body: {
          email: signInDto.email,
          password: signInDto.password,
        },
      });

      if (!result.user || !result.token) {
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('🔍 Better Auth user (without role):', result.user);

      // Manually fetch the full user data with role from database
      const fullUser = await this.prismaService.user.findUnique({
        where: { id: result.user.id },
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
        throw new UnauthorizedException('User not found');
      }

      console.log('🔍 Full user with role:', fullUser);

      return {
        user: fullUser,
        token: result.token,
      };
    } catch (error) {
      console.error('SignIn Error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async signOut(token: string) {
    try {
      await auth.api.signOut({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      return { message: 'Signed out successfully' };
    } catch (error) {
      console.error('SignOut Error:', error);
      throw new UnauthorizedException('Invalid session');
    }
  }

  async getSession(token: string) {
    try {
      const session = await auth.api.getSession({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!session || !session.user) {
        throw new UnauthorizedException('Invalid session');
      }

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
        throw new UnauthorizedException('User not found');
      }

      console.log('🔍 Session user with role:', fullUser);

      return {
        ...session,
        user: fullUser,
      };
    } catch (error) {
      console.error('GetSession Error:', error);
      throw new UnauthorizedException('Invalid session');
    }
  }
}