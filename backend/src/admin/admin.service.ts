import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteBarberDto } from './dto/invite-barber.dto';
import { EmailService } from '../common/services/email.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async inviteBarber(inviteBarberDto: InviteBarberDto, adminId: string) {
    const { email } = inviteBarberDto;

    // Step 1: Check if invitation already exists
    const existingInvitation = await this.prismaService.barberInvitation.findFirst({
      where: { 
        email, 
        status: 'PENDING' 
      }
    });

    if (existingInvitation) {
      throw new ConflictException('Invitation already sent to this email');
    }

    // Step 2: Generate token and expiration
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Step 3: Create invitation record
    const invitation = await this.prismaService.barberInvitation.create({
      data: {
        email,
        token,
        expiresAt,
        createdBy: adminId,
      }
    });

    // Step 4: Generate invitation link
    const invitationLink = `${process.env.FRONTEND_URL}/register/barber?token=${token}`;

    // Step 5: Send email
    let emailSent = false;
    let emailError = null;
    
    try {
      await this.emailService.sendBarberInvitation(email, invitationLink);
      emailSent = true;
      console.log('✅ Invitation sent successfully to:', email);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      emailError = error.message;
      // Don't throw error - invitation is created, email can be retried
    }

    return {
      message: emailSent 
        ? 'Invitation sent successfully' 
        : 'Invitation created but email failed to send',
      emailSent,
      emailError,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
      },
      invitationLink, // For testing/manual sharing
    };
  }
}