'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('admin');
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
          <h1 className="text-2xl font-bold text-blue-600">{t('title')}</h1>
          <div className="text-gray-700">{t('welcome')}</div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">{stats.totalBookings}</div>
            <div className="text-gray-600">{t('stats.totalBookings')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">{stats.totalUsers}</div>
            <div className="text-gray-600">{t('stats.totalUsers')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">${stats.totalRevenue}</div>
            <div className="text-gray-600">{t('stats.totalRevenue')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600 mb-2">{stats.occupancyRate}%</div>
            <div className="text-gray-600">{t('stats.occupancyRate')}</div>
          </div>
        </div>

        {/* Admin Links */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/admin/rooms">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('links.manageRooms.title')}</h3>
              <p className="text-gray-600">{t('links.manageRooms.description')}</p>
            </div>
          </Link>
          <Link href="/admin/bookings">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('links.manageBookings.title')}</h3>
              <p className="text-gray-600">{t('links.manageBookings.description')}</p>
            </div>
          </Link>
          <Link href="/admin/users">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('links.manageUsers.title')}</h3>
              <p className="text-gray-600">{t('links.manageUsers.description')}</p>
            </div>
          </Link>
          <Link href="/admin/reports">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('links.reports.title')}</h3>
              <p className="text-gray-600">{t('links.reports.description')}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
