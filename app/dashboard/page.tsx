'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d11] text-amber-500 font-medium tracking-widest">
        LOADING ETHIOSTAY...
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  return (
    <div className="relative min-h-screen text-zinc-100 overflow-hidden font-sans selection:bg-amber-500/30">
      
      {/* Immersive Ethiopian Highlands Sunset Background Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(13, 13, 17, 0.5), rgba(13, 13, 17, 0.85)), url('https://images.unsplash.com/photo-1547153198-4c803cf86bf9?q=80&w=2000&auto=format&fit=crop')`,
        }}
      />

      {/* Main Content Wrapper */}
      <div className="relative max-w-6xl mx-auto px-6 py-20 z-10 dynamic-fade-in">
        
        {/* Quick Actions Grid - Elegant Minimal Glassmorphism */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {/* Card 1: Browse Rooms */}
          <Link href="/rooms">
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, backgroundColor: 'rgba(9, 9, 11, 0.55)' }}
              whileTap={{ scale: 0.99 }}
              className="backdrop-blur-md bg-zinc-950/40 border border-white/[0.06] hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 shadow-xl cursor-pointer group"
            >
              <div className="text-amber-400/90 mb-4 transition-transform group-hover:scale-105 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1.5 transition-colors group-hover:text-amber-400">Browse Rooms</h3>
              <p className="text-zinc-400/90 text-xs leading-relaxed font-light">Explore hand-picked luxury lodges, heritage houses, and boutique spaces.</p>
            </motion.div>
          </Link>

          {/* Card 2: My Bookings */}
          <Link href="/dashboard/bookings">
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, backgroundColor: 'rgba(9, 9, 11, 0.55)' }}
              whileTap={{ scale: 0.99 }}
              className="backdrop-blur-md bg-zinc-950/40 border border-white/[0.06] hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 shadow-xl cursor-pointer group"
            >
              <div className="text-amber-400/90 mb-4 transition-transform group-hover:scale-105 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1.5 transition-colors group-hover:text-amber-400">My Bookings</h3>
              <p className="text-zinc-400/90 text-xs leading-relaxed font-light">Review timelines, upgrade packages, or view itinerary confirmations.</p>
            </motion.div>
          </Link>

          {/* Card 3: My Profile */}
          <Link href="/dashboard/profile">
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, backgroundColor: 'rgba(9, 9, 11, 0.55)' }}
              whileTap={{ scale: 0.99 }}
              className="backdrop-blur-md bg-zinc-950/40 border border-white/[0.06] hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 shadow-xl cursor-pointer group"
            >
              <div className="text-amber-400/90 mb-4 transition-transform group-hover:scale-105 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1.5 transition-colors group-hover:text-amber-400">My Profile</h3>
              <p className="text-zinc-400/90 text-xs leading-relaxed font-light">Update dynamic parameters, customize stay preferences, and settings.</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Recent Bookings Panel - Simplified Minimal Table */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="backdrop-blur-md bg-zinc-950/40 border border-white/[0.06] rounded-2xl shadow-2xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-100 tracking-wide flex items-center gap-2.5">
              <span>Recent Bookings</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </h2>
          </div>
          
          {loading ? (
            <p className="text-zinc-400 font-light text-sm animate-pulse tracking-wide">Loading reservation history...</p>
          ) : bookings.length === 0 ? (
            <p className="text-zinc-400 font-light text-sm tracking-wide">
              No active reservations discovered.{' '}
              <Link href="/rooms" className="text-amber-400 hover:text-amber-350 underline underline-offset-4 transition-colors font-medium">
                Browse rooms
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full token-table">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-400 text-[11px] font-medium tracking-widest uppercase">
                    <th className="text-left pb-4 px-3 font-semibold">Room</th>
                    <th className="text-left pb-4 px-3 font-semibold">Check-in</th>
                    <th className="text-left pb-4 px-3 font-semibold">Check-out</th>
                    <th className="text-left pb-4 px-3 font-semibold">Status</th>
                    <th className="text-right pb-4 px-3 font-semibold">Total Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <AnimatePresence>
                    {bookings.map((booking: any, idx: number) => (
                      <motion.tr 
                        key={booking._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/[0.02] transition-colors group text-sm"
                      >
                        <td className="py-4 px-3 text-zinc-200 font-medium group-hover:text-amber-400 transition-colors">
                          Room {booking.roomId?.roomNumber || 'N/A'}
                        </td>
                        <td className="py-4 px-3 text-zinc-400 font-light group-hover:text-zinc-300 transition-colors">
                          {new Date(booking.checkInDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-3 text-zinc-400 font-light group-hover:text-zinc-300 transition-colors">
                          {new Date(booking.checkOutDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border ${
                            booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            booking.status === 'checked_in' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            booking.status === 'checked_out' ? 'bg-zinc-500/10 text-zinc-400 border-white/[0.06]' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              booking.status === 'confirmed' ? 'bg-emerald-400' :
                              booking.status === 'checked_in' ? 'bg-blue-400' :
                              booking.status === 'checked_out' ? 'bg-zinc-400' :
                              'bg-amber-400'
                            }`} />
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 font-semibold text-amber-400 text-right">
                          ${booking.totalPrice}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}