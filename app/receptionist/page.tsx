'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ReceptionistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [action, setAction] = useState<'check-in' | 'check-out' | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'receptionist' && userRole !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
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

  const handleAction = async (bookingId: string, type: 'check-in' | 'check-out') => {
    try {
      const endpoint = type === 'check-in' 
        ? `/api/bookings/${bookingId}/check-in`
        : `/api/bookings/${bookingId}/check-out`;

      const res = await fetch(endpoint, {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        alert(`Guest ${type === 'check-in' ? 'checked in' : 'checked out'} successfully!`);
        setSelectedBooking(null);
        setAction(null);
        fetchBookings();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Reception Desk</h1>
          <div className="text-gray-700">Welcome, {(session?.user as any)?.name}!</div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Check-in</h3>
            <p className="text-gray-600">Process guest arrivals</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition">
            <div className="text-4xl mb-4">🚪</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Check-out</h3>
            <p className="text-gray-600">Process guest departures</p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today&apos;s Bookings</h2>

          {loading ? (
            <p className="text-gray-600">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-600">No bookings today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Guest Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Room</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-out</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: any) => (
                    <tr key={booking._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">{booking.guestName}</td>
                      <td className="py-3 px-4 text-gray-700">{booking.roomId?.roomNumber || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${
                          booking.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {booking.status === 'confirmed' && (
                          <Button
                            onClick={() => handleAction(booking._id, 'check-in')}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3"
                          >
                            Check In
                          </Button>
                        )}
                        {booking.status === 'checked_in' && (
                          <Button
                            onClick={() => handleAction(booking._id, 'check-out')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3"
                          >
                            Check Out
                          </Button>
                        )}
                      </td>
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
