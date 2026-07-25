import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

interface InvitationData {
  valid: boolean;
  invitation?: {
    id: string;
    email: string;
    expiresAt: string;
  };
}

const RegisterBarber = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // State management
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specializations: '',
    photo: null as File | null,
  });

  // Validate invitation token on page load
  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      toast.error('No invitation token provided');
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Validating token:', token);

      const response = await apiService.request<InvitationData>(
        `/auth/validate-invitation?token=${token}`,
        { method: 'GET' }
      );

      console.log('✅ Token validation response:', response);

      if (response.valid && response.invitation) {
        setInvitationData(response);
        setFormData(prev => ({
          ...prev,
          email: response.invitation!.email
        }));
        toast.success('Invitation is valid! Please complete your registration.');
      } else {
        throw new Error('Invalid invitation');
      }

    } catch (error: any) {
      console.error('❌ Token validation failed:', error);
      
      if (error.status === 401) {
        if (error.message?.includes('expired')) {
          toast.error('This invitation has expired. Please contact the administrator.');
        } else if (error.message?.includes('used')) {
          toast.error('This invitation has already been used.');
        } else {
          toast.error('Invalid invitation token.');
        }
      } else {
        toast.error('Failed to validate invitation. Please try again.');
      }
      
      // Redirect after showing error
      setTimeout(() => navigate('/'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, WebP)');
        return;
      }

      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }

    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Prepare form data for submission
      const registrationData = {
        token: token!,
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        specializations: formData.specializations.trim() || undefined,
      };

      console.log('📤 Submitting barber registration:', { ...registrationData, password: '***' });

      // Call the real API
      const response = await apiService.registerBarber(registrationData);
      
      console.log('✅ Registration successful:', response);
      
      toast.success('Registration completed successfully! Welcome to the team!');
      
      // Auto-login the barber and redirect to dashboard
      if (response.user && response.token) {
        // Store the auth data (same as login)
        localStorage.setItem('auth_token', response.token);
        
        // Update auth store
        const { user, token: authToken } = useAuthStore.getState();
        useAuthStore.setState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });

        console.log('🔄 Auto-logged in barber, redirecting to dashboard...');
        
        // Redirect to barber dashboard
        setTimeout(() => {
          navigate('/barber/dashboard');
        }, 1500);
      } else {
        // Fallback: redirect to login
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration completed! Please login with your new account.',
              email: formData.email 
            }
          });
        }, 2000);
      }

    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      if (error.status === 401) {
        toast.error('Invalid or expired invitation token');
      } else if (error.status === 409) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating invitation...</p>
        </motion.div>
      </div>
    );
  }

  // Error state (invitation invalid)
  if (!invitationData?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <Card>
            <CardContent className="p-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
              <p className="text-gray-600 mb-4">
                This invitation link is not valid or has expired.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Complete Your Barber Registration</CardTitle>
              <p className="text-muted-foreground">
                Set up your profile to join our barbershop team
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email (disabled) */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This email was provided in your invitation
                  </p>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a secure password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Specializations */}
                <div>
                  <Label htmlFor="specializations">Specializations (Optional)</Label>
                  <Textarea
                    id="specializations"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleInputChange}
                    placeholder="e.g., Hair cuts, Beard styling, Hair coloring, Straight razor shaves"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Describe your skills and specialties
                  </p>
                </div>

                {/* Photo Upload */}
                <div>
                  <Label htmlFor="photo">Profile Photo (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('photo')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Photo
                    </Button>
                    {formData.photo && (
                      <span className="text-sm text-muted-foreground">
                        {formData.photo.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a professional photo (JPEG, PNG, WebP - max 5MB)
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? 'Creating Account...' : 'Complete Registration'}
                </Button>

              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterBarber;