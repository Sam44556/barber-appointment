import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { barbers } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, BarChart3, Clock, Trash2, Copy, Check } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

const AdminStaff = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const generateInvite = () => {
    const token = Math.random().toString(36).substring(2, 15);
    setInviteLink(`${window.location.origin}/barber/register?invite=${token}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Staff</h1>
      </div>

      <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map((barber) => (
          <motion.div key={barber.id} variants={FADE_UP}>
            <Card>
              <CardContent className="p-6">
                {deleteConfirm === barber.id ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <p className="text-sm font-medium">Remove {barber.name}?</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setDeleteConfirm(null)}>Confirm</Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      <img
                        src={barber.avatarUrl}
                        alt={barber.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-bold">{barber.name}</h3>
                        <p className="text-sm text-muted-foreground">{barber.specialty}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-border">Active</span>
                          <span className="font-mono text-xs text-muted-foreground">42 cuts this month</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="gap-1 flex-1"><BarChart3 className="h-3 w-3" /> Analytics</Button>
                      <Button variant="outline" size="sm" className="gap-1 flex-1"><Clock className="h-3 w-3" /> Hours</Button>
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
          <Dialog>
            <DialogTrigger asChild>
              <Card className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Invite new barber</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Invite a Barber</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Barber's email</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="barber@example.com"
                  />
                </div>
                <Button className="w-full" onClick={generateInvite}>Generate invite link</Button>
                {inviteLink && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <p className="font-mono text-xs truncate flex-1">{inviteLink}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyLink}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminStaff;
