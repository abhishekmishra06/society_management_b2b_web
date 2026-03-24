'use client';

import Image from 'next/image';
import { Phone, Mail, MessageCircle } from 'lucide-react';

export default function ContactAdminPage() {
  const admin = {
    name: 'Rahul Sharma',
    role: 'Society Admin',
    phone: '+91 98765 43210',
    email: 'admin@mytower.com',
    image: '/admin.jpg', 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">

        {/* HEADER */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Contact Admin
        </h2>

        {/* ADMIN PROFILE */}
        <div className="flex flex-col items-center text-center">

          <Image
            src={admin.image}
            alt="Admin"
            width={100}
            height={100}
            className="rounded-full object-cover border-4 border-purple-100"
          />

          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {admin.name}
          </h3>

          <p className="text-sm text-gray-500">
            {admin.role}
          </p>
        </div>


        {/* CONTACT DETAILS */}
        <div className="mt-6 space-y-4">

          {/* PHONE */}
          <a
            href={`tel:${admin.phone}`}
            className="flex items-center gap-3 p-4 rounded-xl border hover:bg-purple-50 transition"
          >
            <div className="bg-purple-100 p-2 rounded-lg">
              <Phone className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-900 font-medium">{admin.phone}</p>
            </div>
          </a>

          {/* EMAIL */}
          <a
            href={`mailto:${admin.email}`}
            className="flex items-center gap-3 p-4 rounded-xl border hover:bg-purple-50 transition"
          >
            <div className="bg-purple-100 p-2 rounded-lg">
              <Mail className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900 font-medium">{admin.email}</p>
            </div>
          </a>

        </div>

        {/* MESSAGE BOX */}
        <div className="mt-6">

          <textarea
            placeholder="Write your message to admin..."
            rows={4}
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-purple-600 outline-none resize-none"
          />

          <button
            className="mt-4 w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Send Message
          </button>

        </div>

      </div>
    </div>
  );
}