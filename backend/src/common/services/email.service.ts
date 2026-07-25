import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class EmailService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  async sendBarberInvitation(email: string, invitationLink: string) {
    try {
      console.log('📧 Starting email send to:', email);
      console.log('🔗 Invitation link:', invitationLink);
      
      // Create email template
      const emailHtml = this.createInvitationEmailTemplate(invitationLink);
      
      console.log('📧 Calling Supabase inviteUserByEmail...');
      
      // Send email using Supabase Edge Function or direct API
      // Note: This requires setting up Supabase email configuration
      const { data, error } = await this.supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          invitation_link: invitationLink,
          role: 'BARBER'
        },
        redirectTo: invitationLink
      });

      if (error) {
        console.error('❌ Supabase email error:', error);
        throw new Error(`Failed to send invitation email: ${error.message}`);
      }

      console.log('✅ Supabase email response:', data);
      console.log('✅ Invitation email sent successfully to:', email);
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Email service error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0]
      });
      throw error;
    }
  }

  private createInvitationEmailTemplate(invitationLink: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">You're Invited to Join Our Barbershop Team!</h2>
        
        <p>Hello,</p>
        
        <p>You've been invited to join our barbershop as a professional barber.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Complete Your Registration</h3>
          <p>Click the button below to set up your barber profile:</p>
          <a href="${invitationLink}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Complete Registration
          </a>
        </div>
        
        <p><strong>What you'll be able to do:</strong></p>
        <ul>
          <li>Set up your profile with photo and specializations</li>
          <li>Manage your appointment schedule</li>
          <li>Track your bookings and client history</li>
        </ul>
        
        <p style="color: #666; font-size: 14px;">
          This invitation expires in 7 days. If you didn't expect this invitation, please ignore this email.
        </p>
        
        <p>Best regards,<br>The Barbershop Team</p>
      </div>
    `;
  }
}