'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Loader2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

 

  const handleLogin = async (e) => {
    console.log("HANDLE LOGIN TRIGGERED");
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await apiClient.post(API_ENDPOINTS.LOGIN, formData);
      

      console.log('Login response:', data);
      
      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('societyId', data.user.societyId || '');
      localStorage.setItem('userPermissions', JSON.stringify(data.user.permissions || ['FULL_ACCESS']));
      
      // Track first login for welcome guide
      if (data.user.isFirstLogin) {
        localStorage.setItem('isFirstLogin', 'true');
        localStorage.removeItem('welcomeGuideSeen');
      }
      
      // If user has towers, set the first one as default
      if (data.towers && data.towers.length > 0) {
        localStorage.setItem('selectedTower', data.towers[0].id);
      }
      
      toast.success('Login successful!');
      // Redirect based on role
      if (data.user.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen grid lg:grid-cols-2">

      {/* LEFT SIDE BRANDING */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-16">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white/20 backdrop-blur-lg">
            <Building2 className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold">MyTower</h1>
        </div>

        <p className="text-lg text-white/80 text-center max-w-md">
          Smart Society Management System designed to simplify 
          security, visitor management, billing, and operations 
          for modern residential communities.
        </p>

      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="flex items-center justify-center bg-muted/40 px-6">

        <Card className="w-full max-w-md border-0 shadow-2xl backdrop-blur-xl bg-white/80">
          <CardContent className="p-8">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="p-3 rounded-xl bg-indigo-600 text-white">
                  <Building2 className="h-8 w-8" />
                </div>
              </div>

              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Login to your dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* User ID */}
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                  placeholder="Enter your user ID"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label>Password</Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

            </form>

            {/* Reset Password */}
            <div className="mt-6 text-center text-sm">
              <Link
                href="/reset-password"
                className="text-indigo-600 hover:underline font-medium"
              >
                Reset your password here
              </Link>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
