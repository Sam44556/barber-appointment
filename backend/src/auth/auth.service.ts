import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { auth } from '../lib/auth';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RegisterBarberDto } from './dto/register-barber.dto';
import { randomUUID } from 'crypto';

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

  async registerBarber(registerBarberDto: RegisterBarberDto) {
    try {
      console.log('🔍 Starting barber registration for:', registerBarberDto.email);

      // Step 1: Validate invitation token (reuse existing method)
      const invitationValidation = await this.validateInvitationToken(registerBarberDto.token);
      
      if (!invitationValidation.valid || !invitationValidation.invitation) {
        throw new UnauthorizedException('Invalid or expired invitation token');
      }

      const invitation = invitationValidation.invitation;

      // Step 2: Verify email matches invitation
      if (invitation.email !== registerBarberDto.email) {
        throw new UnauthorizedException('Email does not match invitation');
      }

      // Step 3: Check if user already exists
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: registerBarberDto.email }
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Step 4: Create user account using Better Auth
      console.log('📝 Creating user account with Better Auth...');
      
      const authResult = await auth.api.signUpEmail({
        body: {
          email: registerBarberDto.email,
          password: registerBarberDto.password,
          name: registerBarberDto.name,
          ...(registerBarberDto.phone && { phone: registerBarberDto.phone }),
        },
      });

      if (!authResult.user || !authResult.token) {
        throw new Error('Failed to create user account');
      }

      console.log('✅ User account created:', authResult.user.id);

      // Step 5: Update user role to BARBER
      const updatedUser = await this.prismaService.user.update({
        where: { id: authResult.user.id },
        data: { role: 'BARBER' }
      });

      console.log('✅ User role updated to BARBER');

      // Step 6: Create barber profile
      const barber = await this.prismaService.barber.create({
        data: {
          userId: authResult.user.id,
          specializations: registerBarberDto.specializations,
          // photo: null, // TODO: Handle photo upload later
        }
      });

      console.log('✅ Barber profile created:', barber.id);

      // Step 7: Mark invitation as accepted
      await this.prismaService.barberInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          usedAt: new Date(),
          userId: authResult.user.id,
        }
      });

      console.log('✅ Invitation marked as accepted');

      // Step 8: Fetch complete user data with role
      const fullUser = await this.prismaService.user.findUnique({
        where: { id: authResult.user.id },
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

      console.log('✅ Barber registration completed successfully');

      return {
        message: 'Barber registration completed successfully',
        user: fullUser,
        token: authResult.token,
        barber: {
          id: barber.id,
          specializations: barber.specializations,
          isActive: barber.isActive,
        }
      };

    } catch (error) {
      console.error('❌ Barber registration failed:', error);
      
      if (error instanceof UnauthorizedException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new Error(`Registration failed: ${error.message || 'Unknown error'}`);
    }
  }

  async validateInvitationToken(token: string) {
    try {
      // Find invitation by token
      const invitation = await this.prismaService.barberInvitation.findUnique({
        where: { token },
      });

      if (!invitation) {
        throw new UnauthorizedException('Invalid invitation token');
      }

      // Check if already used
      if (invitation.status === 'ACCEPTED') {
        throw new UnauthorizedException('Invitation already used');
      }

      // Check if expired
      const now = new Date();
      if (invitation.expiresAt < now) {
        // Update status to EXPIRED
        await this.prismaService.barberInvitation.update({
          where: { id: invitation.id },
          data: { status: 'EXPIRED' }
        });
        throw new UnauthorizedException('Invitation has expired');
      }

      // Check if cancelled
      if (invitation.status === 'CANCELLED') {
        throw new UnauthorizedException('Invitation was cancelled');
      }

      console.log('✅ Invitation token is valid:', invitation.email);

      return {
        valid: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
        }
      };

    } catch (error) {
      console.error('❌ Token validation failed:', error.message);
      throw error;
    }
  }

  async getSession(token: string) {
    try {
      console.log('🔍 AuthService: Manual token validation...');
      
      // Try Better Auth first
      try {
        const session = await auth.api.getSession({
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        if (session && session.user) {
          console.log('✅ Better Auth session found');
          
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

          if (fullUser) {
            return {
              ...session,
              user: fullUser,
            };
          }
        }
      } catch (betterAuthError) {
        console.log('❌ Better Auth validation failed:', betterAuthError.message);
      }

      // Fallback: Manual token validation using database
      console.log('� Trying manual session lookup...');
      
      // Look for session directly in database using the token
      const dbSession = await this.prismaService.session.findFirst({
        where: {
          token: token,
          expiresAt: {
            gt: new Date(), // Token not expired
          },
        },
        include: {
          user: {
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
          },
        },
      });

      if (dbSession && dbSession.user) {
        console.log('✅ Found session in database manually');
        return {
          session: {
            id: dbSession.id,
            userId: dbSession.userId,
            expiresAt: dbSession.expiresAt,
            token: dbSession.token,
          },
          user: dbSession.user,
        };
      }

      console.log('❌ No valid session found anywhere');
      throw new UnauthorizedException('Invalid session');
      
    } catch (error) {
      console.error('GetSession Error:', error);
      throw new UnauthorizedException('Invalid session');
    }
  }
}