import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FADE_UP } from '@/lib/animations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Shield, Camera, Loader2, Save, Upload, CheckCircle2, Image as ImageIcon, Scissors } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

// Client-side image compressor (resizes high-res device photos to ~100KB in <15ms)
const compressImageFile = (file: File, maxWidth = 600, maxHeight = 600, quality = 0.82): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality,
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function BarberProfile() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef          = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [name, setName]                 = useState('');
  const [phone, setPhone]               = useState('');
  const [specializations, setSpecializations] = useState('');
  const [image, setImage]               = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stats, setStats]               = useState({ totalAppointments: 0, totalTimeOff: 0 });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyBarberProfile();
      setName(data.user?.name || user?.name || '');
      setPhone(data.user?.phone || '');
      setImage(data.user?.image || data.photo || '');
      setSpecializations(data.specializations || '');
      setStats({
        totalAppointments: data._count?.appointments || 0,
        totalTimeOff: data._count?.timeOff || 0,
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle local device file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    // Compress device file down to fast web size (~100KB)
    const compressed = await compressImageFile(file);
    setSelectedFile(compressed);

    // Live preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      toast.success('Photo optimized & attached! Click "Save Profile Changes".');
    };
    reader.readAsDataURL(compressed);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Single request sends Name, Phone, Specializations, AND attached photo File together
      const updated = await apiService.updateMyBarberProfile({
        name,
        phone,
        specializations,
        image: selectedFile ? undefined : image,
        file: selectedFile,
      });

      setSelectedFile(null);
      if (updated?.user?.image) setImage(updated.user.image);
      toast.success('Barber profile & photo updated successfully!');

      if (updated?.user) {
        updateUser({
          ...user,
          name: updated.user.name,
          phone: updated.user.phone,
          image: updated.user.image,
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <motion.div
      variants={FADE_UP}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Hidden Device File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          Barber Settings
        </p>
        <h1 className="font-display text-3xl font-bold">My Profile & Barber Specificity</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Update your barber specialties, phone, full name, and device profile photo in one click
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar Preview */}
        <Card className="border-border rounded-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div
              className="relative group w-36 h-36 mx-auto cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-36 h-36 rounded-full object-cover border-2 border-primary shadow-sm group-hover:opacity-85 transition-opacity"
                />
              ) : (
                <div className="w-36 h-36 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-display font-bold text-4xl group-hover:bg-primary/20 transition-colors">
                  {name ? name.charAt(0).toUpperCase() : 'B'}
                </div>
              )}

              <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} />
                <span className="text-[10px] font-mono mt-1 font-bold">Upload Photo</span>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-lg">{name || 'Barber'}</h3>
              {specializations && (
                <p className="font-body text-xs text-primary font-medium mt-0.5">
                  {specializations}
                </p>
              )}
              <p className="font-mono text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <Shield size={12} /> BARBER ROLE
              </p>
            </div>

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full gap-2 font-body text-xs"
              variant="outline"
            >
              <Upload size={14} /> Select File From Device
            </Button>

            <div className="border-t border-border pt-4 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cuts:</span>
                <span className="font-bold">{stats.totalAppointments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time-Off Entries:</span>
                <span className="font-bold">{stats.totalTimeOff}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Profile Form */}
        <Card className="border-border rounded-sm md:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Device File Upload Dropzone */}
              <div className="space-y-2">
                <Label className="font-body text-xs font-semibold flex items-center gap-2">
                  <ImageIcon size={14} /> Profile Picture (Device Upload)
                </Label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary rounded-sm p-5 text-center cursor-pointer transition-colors bg-secondary/20 hover:bg-secondary/40 space-y-2"
                >
                  <Upload className="mx-auto h-7 w-7 text-muted-foreground" />
                  <div>
                    <p className="font-body text-sm font-medium">
                      Click to attach photo file from laptop or mobile
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                      Auto-compressed & uploaded in milliseconds when you click Save
                    </p>
                  </div>

                  {selectedFile ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm font-mono text-xs font-semibold">
                      <CheckCircle2 size={14} /> Optimized: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  ) : (
                    <Button type="button" variant="secondary" size="sm" className="mt-1 font-body text-xs">
                      <Upload size={14} className="mr-1.5" /> Attach Photo File
                    </Button>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-body text-xs font-semibold flex items-center gap-2">
                  <User size={14} /> Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="font-body text-sm"
                  required
                />
              </div>

              {/* Barber Specificity / Specializations */}
              <div className="space-y-2">
                <Label htmlFor="specializations" className="font-body text-xs font-semibold flex items-center gap-2">
                  <Scissors size={14} /> Barber Specialization & Expertise
                </Label>
                <Input
                  id="specializations"
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  placeholder="e.g. Master Barber, Fade Specialist, Beard Sculpting, Hot Towel Shave"
                  className="font-body text-sm"
                />
                <p className="text-[11px] font-body text-muted-foreground">
                  Specify your cut specialties shown to customers when booking appointments.
                </p>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-xs font-semibold flex items-center gap-2">
                  <Mail size={14} /> Email Address (Read-only)
                </Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="font-mono text-sm bg-muted/50 cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-body text-xs font-semibold flex items-center gap-2">
                  <Phone size={14} /> Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="font-mono text-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="gap-2 font-body text-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving Profile & Photo...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Profile Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
