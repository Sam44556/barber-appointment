import { Controller, Post, Get, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'CUSTOMER',
        },
        token: 'jwt_token_here',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in',
    schema: {
      example: {
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'CUSTOMER',
        },
        token: 'jwt_token_here',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: SignInDto })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out the current user' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User successfully signed out',
    schema: { example: { message: 'Signed out successfully' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid session' })
  async signOut(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.authService.signOut(token);
  }

  @Get('debug-session')
  @ApiOperation({ summary: 'Debug current user session without guards' })
  async debugSession(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    console.log('🔍 DEBUG: Token received:', token ? `${token.substring(0, 10)}...` : 'none');
    
    try {
      const result = await this.authService.getSession(token);
      console.log('🔍 DEBUG: Session result:', { hasUser: !!result.user, userRole: result.user?.role });
      return { success: true, result };
    } catch (error) {
      console.log('🔍 DEBUG: Session error:', error.message);
      return { success: false, error: error.message };
    }
  }

  @Get('session')
  @ApiOperation({ summary: 'Get current user session' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Current user session',
    schema: {
      example: {
        session: {
          id: 'session_123',
          userId: 'user_123',
          expiresAt: '2024-12-31T23:59:59Z',
        },
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'CUSTOMER',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid session' })
  async getSession(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.authService.getSession(token);
  }
}
