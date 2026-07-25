import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, BarChart3, Clock, Trash2, Copy, Check, Mail, ToggleLeft, ToggleRight, User } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

interface Barber {
  id: string;
  userId: string;
  isActive: boolean;
  specializations?: string;
  photo?: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
}

const AdminStaff = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading barbers...');
      const barbersData = await apiService.getBarbers();
      console.log('✅ Barbers loaded:', barbersData);
      setBarbers(barbersData);
    } catch (error: any) {
      console.error('❌ Failed to load barbers:', error);
      toast.error('Failed to load barbers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBarberStatus = async (barberId: string, currentStatus: boolean) => {
    try {
      console.log(`🔄 Toggling barber ${barberId} status from ${currentStatus} to ${!currentStatus}`);
      
      await apiService.updateBarber(barberId, {
        isActive: !currentStatus
      });

      // Update local state
      setBarbers(barbers.map(barber => 
        barber.id === barberId 
          ? { ...barber, isActive: !currentStatus }
          : barber
      ));

      toast.success(`Barber ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      console.log('✅ Barber status updated successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to update barber status:', error);
      toast.error('Failed to update barber status. Please try again.');
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSending(true);
      console.log('📧 Sending invitation to:', inviteEmail);

      const response = await apiService.request('/admin/invite-barber', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      console.log('✅ Invitation response:', response);

      if (response.emailSent) {
        toast.success(`Invitation email sent successfully to ${inviteEmail}!`);
        setInviteLink(response.invitationLink);
      } else {
        toast.warning(`Invitation created but email failed to send. You can share this link manually.`);
        setInviteLink(response.invitationLink);
      }

    } catch (error: any) {
      console.error('❌ Failed to send invitation:', error);
      
      if (error.status === 409) {
        toast.error('An invitation has already been sent to this email');
      } else if (error.status === 401) {
        toast.error('You are not authorized to send invitations');
      } else {
        toast.error(error.message || 'Failed to send invitation. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Invitation link copied to clipboard!');
  };

  const resetForm = () => {
    setInviteEmail('');
    setInviteLink('');
    setCopied(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Staff</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading barbers...</p>
          </div>
        </div>
      ) : (
        <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map((barber) => (
            <motion.div key={barber.id} variants={FADE_UP}>
              <Card>
                <CardContent className="p-6">
                  {deleteConfirm === barber.id ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <p className="text-sm font-medium">Remove {barber.user?.name}?</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setDeleteConfirm(null)}>Confirm</Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-4">
                        {barber.user?.image ? (
                          <img
                            src={barber.user.image}
                            alt={barber.user?.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-bold">{barber.user?.name}</h3>
                          <p className="text-sm text-muted-foreground">{barber.specializations || 'General Services'}</p>
                          <p className="text-xs text-muted-foreground mt-1">{barber.user?.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span 
                              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                barber.isActive 
                                  ? 'border-green-200 bg-green-50 text-green-700' 
                                  : 'border-red-200 bg-red-50 text-red-700'
                              }`}
                            >
                              {barber.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {barber._count?.appointments || 0} appointments
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 flex-1"
                          onClick={() => toggleBarberStatus(barber.id, barber.isActive)}
                        >
                          {barber.isActive ? (
                            <>
                              <ToggleRight className="h-3 w-3" /> 
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-3 w-3" /> 
                              Activate
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <BarChart3 className="h-3 w-3" /> 
                          Analytics
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm(barber.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Invite card */}
          <motion.div variants={FADE_UP}>
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Card className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors h-full">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                    <UserPlus className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Invite new barber</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Invite a Barber
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteEmail">Barber's Email Address</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="barber@example.com"
                      disabled={sending}
                      onKeyPress={(e) => e.key === 'Enter' && sendInvitation()}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      An invitation email will be sent to this address
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={sendInvitation}
                    disabled={sending || !inviteEmail.trim()}
                  >
                    {sending ? 'Sending Invitation...' : 'Send Invitation Email'}
                  </Button>

                  {inviteLink && (
                    <div className="space-y-2">
                      <Label>Invitation Link (for manual sharing)</Label>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                        <p className="font-mono text-xs truncate flex-1">{inviteLink}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyLink}>
                          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This link expires in 7 days
                      </p>
                    </div>
                  )}

                  {inviteLink && (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={resetForm} className="flex-1">
                        Send Another
                      </Button>
                      <Button onClick={() => setDialogOpen(false)} className="flex-1">
                        Done
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminStaff;
