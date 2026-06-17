'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    occupancyRate: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
          <div className="text-gray-700">Welcome, Admin!</div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">{stats.totalBookings}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">{stats.totalUsers}</div>
            <div className="text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">${stats.totalRevenue}</div>
            <div className="text-gray-600">Total Revenue</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600 mb-2">{stats.occupancyRate}%</div>
            <div className="text-gray-600">Occupancy Rate</div>
          </div>
        </div>

        {/* Admin Links */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/admin/rooms">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Rooms</h3>
              <p className="text-gray-600">Create, edit, and manage hotel rooms</p>
            </div>
          </Link>
          <Link href="/admin/bookings">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Bookings</h3>
              <p className="text-gray-600">View and manage all bookings</p>
            </div>
          </Link>
          <Link href="/admin/users">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Users</h3>
              <p className="text-gray-600">View and manage user accounts</p>
            </div>
          </Link>
          <Link href="/admin/reports">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reports</h3>
              <p className="text-gray-600">View revenue and occupancy reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
