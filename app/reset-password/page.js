'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import LogoIcon from "@/public/icon.webp";
import { toast } from 'sonner'; // or your toast lib

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    identifier: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  // 👉 SEND OTP
  const handleSendOtp = async () => {
    if (!data.identifier) {
      toast.error('Enter email or phone');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success('OTP sent successfully');
      setStep(2);
    }, 1200);
  };

  // 👉 VERIFY OTP
  const handleVerifyOtp = async () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (data.otp === '123456') {
        toast.success('OTP Verified');
        setStep(3);
      } else {
        toast.error('Invalid OTP');
      }
    }, 1200);
  };

  // 👉 RESET PASSWORD
  const handleResetPassword = async () => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Password reset successful');

      setTimeout(() => {
        router.push('/login');
      }, 1000);
    }, 1200);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-white">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-10">
          <Image src={LogoIcon} alt="MyTower" width={40} height={40} />
          <div>
            <h1 className="text-2xl font-bold text-purple-700">
              MyTower
            </h1>
            <p className="text-sm text-gray-500">
              Society Management Platform
            </p>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Reset Password
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          {step === 1 && 'Enter your email or phone'}
          {step === 2 && 'Enter OTP sent to you'}
          {step === 3 && 'Set your new password'}
        </p>

        <div className="space-y-5">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                type="text"
                placeholder="Email or Phone"
                value={data.identifier}
                onChange={(e) =>
                  setData({ ...data, identifier: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              />

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={data.otp}
                onChange={(e) =>
                  setData({ ...data, otp: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              />

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Verify OTP'}
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={data.password}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />

                <button
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              <input
                type="password"
                placeholder="Confirm Password"
                value={data.confirmPassword}
                onChange={(e) =>
                  setData({ ...data, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              />
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}