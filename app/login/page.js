"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginImage from "@/public/login.jpg";
import LogoIcon from "@/public/icon.webp";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Login payload:", formData);

    try {
      const { data } = await apiClient.post(API_ENDPOINTS.LOGIN, formData);

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      localStorage.setItem("societyId", data.user.societyId || "");
      localStorage.setItem(
        "userPermissions",
        JSON.stringify(data.user.permissions || ["FULL_ACCESS"])
      );

      if (data.user.isFirstLogin) {
        localStorage.setItem("isFirstLogin", "true");
        localStorage.removeItem("welcomeGuideSeen");
      }

      if (data.towers && data.towers.length > 0) {
        localStorage.setItem("selectedTower", data.towers[0].id);
      }

      toast.success("Login successful!");

      if (data.user.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">

      {/* LEFT SIDE FULL IMAGE */}
      <div className="relative hidden lg:block">

        <Image
          src={LoginImage}
          alt="MyTower"
          fill
          priority
          className="object-cover"
        />

        {/* purple overlay */}
        <div className="absolute inset-0 bg-purple-900/40"></div>
      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-md">

          {/* LOGO */}
          <div className="flex items-center gap-3 mb-10">
            <Image
              src={LogoIcon}
              alt="MyTower"
              width={40}
              height={40}
            />

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
            Welcome Back
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Login to manage your society operations.
          </p>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* USER */}
            <div>
              <label className="text-sm text-gray-600">
                Society ID
              </label>

              <input
                type="text"
                placeholder="Enter Your Society ID"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                required
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-gray-600">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value }) 
                  } 
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER */}
            <div className="flex justify-between text-sm">

              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="accent-purple-600"
                />
                Remember me
              </label>

              <Link
                href="/reset-password"
                className="text-purple-600 hover:underline"
              >
                Reset password
              </Link>

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="flex items-center text-center">
              <Link
                href="/contact-admin"
                className="text-purple-600 hover:underline"
              >
                Need any help ? Contact Admin
              </Link>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';

// import { Building2, Loader2, Eye, EyeOff } from 'lucide-react';

// import apiClient from '@/lib/api/client';
// import { API_ENDPOINTS } from '@/lib/api/endpoints';
// import { toast } from 'sonner';

// export default function LoginPage() {

//   const router = useRouter();

//   const [showPassword, setShowPassword] = useState(false);

//   const [formData, setFormData] = useState({
//     userId: '',
//     password: '',
//   });

//   const [loading, setLoading] = useState(false);


//   const handleLogin = async (e) => {
//     e.preventDefault();

//     console.log('HANDLE LOGIN TRIGGERED');

//     setLoading(true);

//     try {
//       const { data } = await apiClient.post(API_ENDPOINTS.LOGIN, formData);

//       console.log('Login response:', data);

//       /* Store auth data */
//       localStorage.setItem('authToken', data.token);
//       localStorage.setItem('userData', JSON.stringify(data.user));
//       localStorage.setItem('societyId', data.user.societyId || '');
//       localStorage.setItem(
//         'userPermissions',
//         JSON.stringify(data.user.permissions || ['FULL_ACCESS'])
//       );

//       /* First login check */
//       if (data.user.isFirstLogin) {
//         localStorage.setItem('isFirstLogin', 'true');
//         localStorage.removeItem('welcomeGuideSeen');
//       }

//       /* Default tower selection */
//       if (data.towers && data.towers.length > 0) {
//         localStorage.setItem('selectedTower', data.towers[0].id);
//       }

//       toast.success('Login successful!');

//       /* Redirect */
//       if (data.user.role === 'SUPER_ADMIN') {
//         router.push('/admin');
//       } else {
//         router.push('/dashboard');
//       }

//     } catch (error) {
//       console.error('Login error:', error);
//       toast.error(error.response?.data?.message || 'Invalid credentials');
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <div className="min-h-screen grid lg:grid-cols-2">

//       {/* LEFT SIDE BRANDING */}
//       <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-16">

//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-4 rounded-xl bg-white/20 backdrop-blur-lg">
//             <Building2 className="h-10 w-10" />
//           </div>

//           <h1 className="text-4xl font-bold">
//             MyTower
//           </h1>
//         </div>

//         <p className="text-lg text-white/80 text-center max-w-md">
//           Smart Society Management System designed to simplify
//           security, visitor management, billing, and operations
//           for modern residential communities.
//         </p>

//       </div>


//       {/* RIGHT SIDE LOGIN */}
//       <div className="flex items-center justify-center bg-muted/40 px-6">

//         <Card className="w-full max-w-md border-0 shadow-2xl backdrop-blur-xl bg-white/80">

//           <CardContent className="p-8">

//             {/* HEADER */}
//             <div className="text-center mb-8">

//               <div className="flex justify-center mb-4 lg:hidden">
//                 <div className="p-3 rounded-xl bg-indigo-600 text-white">
//                   <Building2 className="h-8 w-8" />
//                 </div>
//               </div>

//               <h2 className="text-2xl font-bold">
//                 Welcome Back
//               </h2>

//               <p className="text-muted-foreground text-sm mt-1">
//                 Login to your dashboard
//               </p>

//             </div>


//             {/* FORM */}
//             <form onSubmit={handleLogin} className="space-y-5">

//               {/* USER ID */}
//               <div className="space-y-2">

//                 <Label>User ID</Label>

//                 <Input
//                   placeholder="Enter your user ID"
//                   value={formData.userId}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       userId: e.target.value,
//                     }))
//                   }
//                   required
//                 />

//               </div>


//               {/* PASSWORD */}
//               <div className="space-y-2">

//                 <Label>Password</Label>

//                 <div className="relative">

//                   <Input
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Enter your password"
//                     value={formData.password}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         password: e.target.value,
//                       }))
//                     }
//                     required
//                   />

//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
//                   >
//                     {showPassword ? (
//                       <EyeOff size={18} />
//                     ) : (
//                       <Eye size={18} />
//                     )}
//                   </button>

//                 </div>

//               </div>


//               {/* LOGIN BUTTON */}
//               <Button
//                 type="submit"
//                 className="w-full h-11 text-base"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Logging in...
//                   </>
//                 ) : (
//                   'Login'
//                 )}
//               </Button>

//             </form>


//             {/* RESET PASSWORD */}
//             <div className="mt-6 text-center text-sm">

//               <Link
//                 href="/reset-password"
//                 className="text-indigo-600 hover:underline font-medium"
//               >
//                 Reset your password here
//               </Link>

//             </div>

//           </CardContent>

//         </Card>

//       </div>

//     </div>
//   );
// }