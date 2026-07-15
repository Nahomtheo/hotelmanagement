'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { 
  CheckCircle2, 
  LogOut, 
  User, 
  Calendar, 
  DoorOpen, 
  Check, 
  X, 
  MessageSquare,
  ShieldCheck,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import PoliceReport from '@/components/PoliceReport';

export default function ReceptionistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPReport, setShowPReport] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'receptionist' && userRole !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);



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
    useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchBookings();
    }
  }, [session]);

  const handleAction = async (bookingId: string, type: 'check-in' | 'check-out') => {
    try {
      const endpoint = type === 'check-in' 
        ? `/api/bookings/${bookingId}/check-in`
        : `/api/bookings/${bookingId}/check-out`;

      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Guest ${type === 'check-in' ? 'checked in' : 'checked out'} successfully!`);
        fetchBookings();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed');
    }
  };

  const handleCancelBooking = async (bookingId: string, type: 'confirm' | 'cancel') => {
    const endpoint = type === 'confirm'
      ? `/api/bookings/${bookingId}/can-con?confirm=true`
      : `/api/bookings/${bookingId}/can-con?cancel=true`;
    try {
      const res = await fetch(`${endpoint}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Booking ${type === 'confirm' ? 'confirmed' : 'cancelled'} successfully!`);
        fetchBookings();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed');
    }
  };

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'confirmed':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/50';
      case 'checked_in':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50';
      case 'cancelled':
        return 'bg-rose-950/40 text-rose-400 border-rose-900/50';
      default:
        return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Luxury Dark/Gold Navbar */}
      <nav className="bg-[#0c0c0e] border-b border-zinc-800/80 sticky top-0 z-50 backdrop-blur-md bg-[#0c0c0e]/90">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2.5 rounded-xl text-zinc-950 shadow-lg shadow-amber-500/10">
              <Calendar className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
                Reception Desk
              </h1>
              <p className="text-[10px] text-amber-500/70 font-semibold tracking-widest uppercase mt-0.5">
                Front Desk Operations
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 border border-zinc-700">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-200">{(session?.user as any)?.name}</span>
                <span className="text-[9px] text-amber-500/80 font-medium tracking-wider uppercase">Concierge</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Dynamic Action Matrix */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="group bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-amber-500/30 hover:shadow-amber-500/[0.02]">
            <div className="flex items-center justify-between">
              <div className="bg-amber-500/10 text-amber-400 p-4 rounded-xl border border-amber-500/20 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                Live Status
              </span>
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mt-5 mb-1.5 tracking-tight group-hover:text-amber-300 transition-colors">
              Process Check-ins
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Verify incoming reservations, coordinate tailored requests, and activate digital suite keys.
            </p>
          </div>

          <div className="group bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-amber-500/30 hover:shadow-amber-500/[0.02]">
           
            <h3 className="text-lg font-bold text-zinc-100 mt-5 mb-1.5 tracking-tight group-hover:text-amber-300 transition-colors">
              Manage Departures
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Finalize statement folios, log incidentals, and transition rooms back to structural priority.
            </p>

          </div>
          <div className="group bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-amber-500/30 hover:shadow-amber-500/[0.02]">
            <div className="flex items-center justify-between">
              <div className="bg-amber-500/10 text-amber-400 p-4 rounded-xl border border-amber-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                Live Status
              </span>
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mt-5 mb-1.5 tracking-tight group-hover:text-amber-300 transition-colors">
              Generate Police Report
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Compile a comprehensive police report of all current guests, including their personal details and stay information, for law enforcement verification.
            </p>
               <div className="bg-white rounded-xl shadow overflow-hidden">
          <button
            onClick={() => setShowPReport(!showPReport)}
            className="w-full flex items-center justify-between p-5 text-xl font-semibold text-gray-800 hover:bg-gray-50 transition"
          >
            <span>Generate Police Report</span>
            {showPReport ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            
          </button>
          </div>
        
            </div>
        </div>
            {showPReport && (
              <div className="p-6 border-t bg-white">
                <PoliceReport guests={bookings} />
              </div>
            )}

        {/* Schedule Console */}
        <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">
                Today&apos;s Operations
              </h2>
              <p className="text-xs text-amber-500/70 font-medium mt-1">
                Central verification queue for scheduled arrivals and suite itineraries
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-amber-400/60 font-medium tracking-wide animate-pulse">
              Synchronizing with central property management database...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-20 text-center">
              <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">No logistical operations recorded for this cycle.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/40 border-b border-zinc-800/60">
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">Booking Date</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">Guest Folio</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">Suite</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">Itinerary</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">Status</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">Preferences</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-amber-500/80 text-center">Verification</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-amber-500/80 text-right">Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {bookings.map((booking: any) => (
                    <tr key={booking._id} className="hover:bg-zinc-900/30 transition-colors duration-150 group">
                      <td className="py-4 px-6 text-sm font-medium text-zinc-400">
                        {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold text-zinc-200 group-hover:text-amber-200 transition-colors">
                          {booking.guestName}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wider">
                          {booking.roomId?.roomNumber || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col text-xs space-y-1">
                          <span className="text-zinc-300 font-medium flex items-center">
                            <span className="w-1 h-1 bg-amber-400 rounded-full mr-1.5" />
                            In: {new Date(booking.checkInDate).toLocaleDateString()}
                          </span>
                          <span className="text-zinc-500 font-normal flex items-center">
                            <span className="w-1 h-1 bg-zinc-700 rounded-full mr-1.5" />
                            Out: {new Date(booking.checkOutDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusStyles(booking.status)}`}>
                          <span className="w-1 h-1 rounded-full bg-current mr-1.5 opacity-80" />
                          <span className="capitalize">{booking.status?.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {booking.specialRequests ? (
                          <div className="flex items-center space-x-2 max-w-[160px] bg-zinc-900/60 border border-zinc-800 p-2 rounded-lg">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
                            <span className="text-xs text-zinc-300 truncate font-medium">{booking.specialRequests}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            onClick={() => handleCancelBooking(booking._id, 'confirm')}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                            title="Confirm Booking"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            disabled={booking.status === 'cancelled'}
                            onClick={() => handleCancelBooking(booking._id, 'cancel')}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20 rounded-lg transition-all"
                            title="Cancel Booking"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                     <td className="py-4 px-6 text-right">
  {booking.status === "confirmed" && (
    <Button
      onClick={() => handleAction(booking._id, "check-in")}
      className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-zinc-950 text-xs font-bold h-8 px-4 rounded-lg shadow-md transition-all duration-200"
    >
      Check In
    </Button>
  )}

  {booking.status === "checked_in" && (
    <div className="flex flex-col items-end gap-2">
      <span className="text-xs text-emerald-400">
        Checked in by: {booking.checkedInBy?.firstName || booking.checkedInBy?.name || "Unknown"}
      </span>

      <Button
        onClick={() => handleAction(booking._id, "check-out")}
        className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-xs font-bold h-8 px-4 rounded-lg shadow-md shadow-md transition-all duration-200"
      >
        Check Out
      </Button>
    </div>
  )}

  {booking.status === "checked_out" && (
    <div className="flex flex-col items-end gap-1">
      <span className="text-xs text-emerald-400">
        Checked in by: {booking.checkedInBy?.firstName || booking.checkedInBy?.name || "Unknown"}
      </span>

      <span className="text-xs text-sky-400">
        Checked out by: {booking.checkedOutBy?.firstName || booking.checkedOutBy?.name || "Unknown"}
      </span>
       <span className="text-xs text-sky-400">
        Confirmed by : {booking.confirmedBy?.firstName || booking.checkedOutBy?.name || "Unknown"}
      </span>
    </div>
  )}

  {booking.status === "cancelled" && (
    <span className="text-xs text-rose-400">
      Cancelled by: {booking.cancelledBy?.firstName || booking.cancelledBy?.name || "Unknown"}
    </span>
  )}

  {booking.status === "pending" && (
    <span className="text-xs text-yellow-400">
      Waiting for approval
    </span>
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