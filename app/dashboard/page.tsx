'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';


export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings?limit=5');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  const userName = (session?.user as any)?.name || 'Guest';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Hotel Booking</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {userName}!</span>
            <Link href="/auth/logout">
              <Button className="bg-red-600 hover:bg-red-700 text-white">Sign Out</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/rooms">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Rooms</h3>
              <p className="text-gray-600">Explore available rooms and make a booking</p>
            </div>
          </Link>
          <Link href="/dashboard/bookings">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Bookings</h3>
              <p className="text-gray-600">View and manage your bookings</p>
            </div>
          </Link>
          <Link href="/dashboard/profile">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Profile</h3>
              <p className="text-gray-600">Update your account information</p>
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-600">No bookings yet. <Link href="/rooms" className="text-blue-600 hover:underline">Browse rooms</Link> to make your first booking.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Room</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-out</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: any) => (
                    <tr key={booking._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">{booking.roomId?.roomNumber || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'checked_out' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">${booking.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
