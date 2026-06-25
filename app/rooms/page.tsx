'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import RoomImageCard from '@/components/ui/imagecard';

export default function RoomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
   const numberOfNights =
  checkInDate && checkOutDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(checkOutDate).getTime() -
            new Date(checkInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room: any) => {
    if (!(session?.user as any)?.id) {
      router.push('/auth/login');
      return;
    }
    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(session?.user as any)?.id) return;

    const formData = new FormData(e.currentTarget);


    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom._id,
          guestName: formData.get('guestName'),
          guestEmail: formData.get('guestEmail'),
          guestPhone: formData.get('guestPhone'),
          checkInDate: new Date(checkInDate),
          checkOutDate: new Date(checkOutDate),
          numberOfGuests: parseInt(formData.get('numberOfGuests') as string),
          specialRequests: formData.get('specialRequests'),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Booking created successfully!');
        setShowBookingForm(false);
        setSelectedRoom(null);
        fetchRooms();
      } else {
        alert(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Hotel Booking</h1>
          </Link>
          {session?.user && (
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Dashboard</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Rooms</h1>
          <div className="grid md:grid-cols-2 gap-4 bg-white rounded-lg shadow p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading rooms...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room: any) => (
              <div key={room._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
               <div className="relative h-64 overflow-hidden rounded-2xl">
                {room.images && room.images.length > 0 ? (
                    <RoomImageCard images={room.images} />
                  ) : (
                   <div className="flex h-full items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
                     <div className="text-5xl">🏨</div>
                   </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Room {room.roomNumber}</h3>
                  <p className="text-sm text-gray-600 mb-2 capitalize">{room.type} Room</p>
                  <p className="text-sm text-gray-600 mb-4">Max Guests: {room.maxGuests}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">${room.pricePerNight}</span>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleBookRoom(room)}
                    disabled={room.status !== 'available'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingForm && selectedRoom && (
 <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
  <div className="flex min-h-screen items-center justify-center p-4">
    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl">

     
    {/* Header */}
     <div className="sticky top-0 z-10 rounded-t-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 text-white">
        
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 text-white">
      <h2 className="text-3xl font-bold">
        Reserve Room {selectedRoom?.roomNumber}
      </h2>

      <p className="mt-1 text-slate-300">
        Complete your reservation details
      </p>
    </div>
    </div>
<div className="overflow-y-auto p-8">
    <form
      onSubmit={handleSubmitBooking}
      className="space-y-6 p-8"
    >

      {/* Room Summary */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Room Type
            </p>

            <p className="font-semibold capitalize">
              {selectedRoom.type}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500">
              Per Night
            </p>

            <p className="text-xl font-bold text-emerald-600">
              ${selectedRoom.pricePerNight}
            </p>
          </div>
        </div>
      </div>

      {/* Guest Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Guest Name
        </label>

        <input
          type="text"
          name="guestName"
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      {/* Email + Phone */}
      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            name="guestEmail"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Phone
          </label>

          <input
            type="tel"
            name="guestPhone"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

      </div>

      {/* Check In / Check Out */}
      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Check-In Date
          </label>

          <input
            type="date"
            name="checkIn"
            required
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Check-Out Date
          </label>

          <input
            type="date"
            name="checkOut"
            required
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
        {numberOfNights > 0 && (
          <div className="md:col-span-2">
            <p className="text-sm text-slate-500">
              Total Nights: {numberOfNights}
            </p>
            <p className="text-lg font-semibold text-emerald-600">
              Total Price: ${numberOfNights * selectedRoom.pricePerNight}
            </p>
          </div>
        )}

      </div>

      {/* Guests */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Number of Guests
        </label>

        <input
          type="number"
          name="numberOfGuests"
          min="1"
          max={selectedRoom.maxGuests}
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      {/* Special Requests */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Special Requests
        </label>

        <textarea
          name="specialRequests"
          rows={4}
          placeholder="Airport pickup, late check-in, extra pillows..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-2">

        <button
          type="button"
          onClick={() => {
            setShowBookingForm(false);
            setSelectedRoom(null);
          }}
          className="flex-1 rounded-xl border border-slate-300 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="flex-1 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02]"
        >
          Confirm Reservation
        </button>

      </div>

    </form>
    </div>

    
  </div>
</div>
</div>
      )}

    </div>
  );
}
