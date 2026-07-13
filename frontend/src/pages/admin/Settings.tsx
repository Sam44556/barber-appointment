import { useState } from 'react';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertTriangle } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminSettings = () => {
  const [shopName, setShopName] = useState('FADE CUT');
  const [address, setAddress] = useState('123 Main Street, New York, NY 10001');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [email, setEmail] = useState('hello@fadecut.com');
  const [minNotice, setMinNotice] = useState('2');
  const [cancelWindow, setCancelWindow] = useState('2');
  const [slotDuration, setSlotDuration] = useState('30');
  const [workingDays, setWorkingDays] = useState<Record<string, boolean>>(
    Object.fromEntries(days.map((d) => [d, d !== 'Sunday']))
  );
  const [dangerOpen, setDangerOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="visible" className="space-y-8 max-w-2xl">
      <h1 className="font-display text-2xl">Settings</h1>

      {/* Shop info */}
      <motion.div variants={FADE_UP}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-display text-lg">Shop Information</h3>
            <div>
              <Label>Shop name</Label>
              <Input value={shopName} onChange={(e) => setShopName(e.target.value)} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Working hours */}
      <motion.div variants={FADE_UP}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-display text-lg">Working Hours</h3>
            {days.map((day) => (
              <div key={day} className="flex items-center gap-4" style={{ opacity: workingDays[day] ? 1 : 0.4 }}>
                <Switch checked={workingDays[day]} onCheckedChange={(v) => setWorkingDays({ ...workingDays, [day]: v })} />
                <span className="w-24 text-sm font-medium">{day}</span>
                {workingDays[day] && (
                  <div className="flex items-center gap-2">
                    <Input defaultValue="09:00" className="w-24 font-mono text-sm" />
                    <span className="text-muted-foreground">—</span>
                    <Input defaultValue="18:00" className="w-24 font-mono text-sm" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking rules */}
      <motion.div variants={FADE_UP}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-display text-lg">Booking Rules</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Min notice (hrs)</Label>
                <Input type="number" value={minNotice} onChange={(e) => setMinNotice(e.target.value)} />
              </div>
              <div>
                <Label>Cancel window (hrs)</Label>
                <Input type="number" value={cancelWindow} onChange={(e) => setCancelWindow(e.target.value)} />
              </div>
              <div>
                <Label>Slot duration (min)</Label>
                <Input type="number" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Button className="w-full">Save Changes</Button>

      {/* Danger zone */}
      <Collapsible open={dangerOpen} onOpenChange={setDangerOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2 border-dashed">
            <AlertTriangle className="h-4 w-4" /> Danger Zone <ChevronDown className="h-4 w-4 ml-auto" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-3 border-dashed">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Type <strong>{shopName}</strong> to confirm deletion of all data.</p>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={shopName} />
              <Button disabled={confirmText !== shopName} className="w-full">Delete all data</Button>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default AdminSettings;
