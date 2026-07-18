'use client';
import { NATIONALITIES } from '@/constants/nationalities';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import RoomImageCard from '@/components/ui/imagecard';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function RoomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('roomsPage');
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
            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
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
          nationality:formData.get('nationality'),
          reasonOfStay:formData.get ('reasonOfStay'),
          checkInDate: new Date(checkInDate),
          checkOutDate: new Date(checkOutDate),
          numberOfGuests: parseInt(formData.get('numberOfGuests') as string),
          specialRequests: formData.get('specialRequests'),
          passport_no:formData.get('passportno'),
          id_no:formData.get('idnumber')
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(t('alerts.bookingSuccess'));
        setShowBookingForm(false);
        setSelectedRoom(null);
        fetchRooms();
      } else {
        alert(data.message || t('alerts.bookingFailed'));
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(t('alerts.createBookingFailed'));
    }
  };

  return (
    <div className="relative min-h-screen text-zinc-100 overflow-hidden font-sans selection:bg-amber-500/30">
      
      {/* Immersive Ethiopian Highlands Sunset Background Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(13, 13, 17, 0.65), rgba(13, 13, 17, 0.9)), url('https://images.unsplash.com/photo-1547153198-4c803cf86bf9?q=80&w=2000&auto=format&fit=crop')`,
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
       

        {/* Content Wrapper */}
        <div className="max-w-7xl mx-auto px-6 py-16 w-full flex-1">
          
          {/* Header & Date Pickers */}
          <div className="mb-12  flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-6">
            <h2 className="text-3xl font-bold tracking-wide text-zinc-100 mb-6">{t('title')}</h2>
            
            <div className="grid md:grid-cols-2 gap-6 backdrop-blur-md bg-zinc-950/40 border border-white/[0.06] rounded-2xl p-6 shadow-xl">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2.5">{t('checkInDate')}</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2.5">{t('checkOutDate')}</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Rooms Display */}
          {loading ? (
            <div className="text-center py-24 text-zinc-400 font-light tracking-wide animate-pulse">
              {t('loading')}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room: any) => (
                <div key={room._id} className="backdrop-blur-md bg-zinc-950/40 border border-white/[0.06] hover:border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col group">
                  <div className="relative h-60 overflow-hidden m-3 rounded-xl">
                    {room.images && room.images.length > 0 ? (
                      <RoomImageCard images={room.images} />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <span className="text-zinc-500 text-xs tracking-widest">{t('noImage')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 pt-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">{t('roomLabel', { number: room.roomNumber })}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          room.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {room.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-light capitalize mb-1">{room.type} {t('suite')}</p>
                      <p className="text-xs text-zinc-500 font-light mb-2">{t('accommodates', { count: room.maxGuests })}</p>
                      <p className="text-sm text-zinc-400 font-light mb-2">{room.description || t('defaultDescription')}</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline mb-4">
                        <span className="text-zinc-400 text-xs font-light">{t('pricePerNight')}</span>
                        <span className="text-2xl font-bold text-amber-400">${room.pricePerNight}</span>
                      </div>
                      
                     
                      
                      <Button
                        onClick={() => handleBookRoom(room)}
                        disabled={room.status !== 'available'}
                        className="w-full bg-zinc-900/80 border border-white/[0.08] hover:bg-amber-500 hover:text-zinc-950 hover:border-transparent text-zinc-100 font-medium py-5 rounded-xl disabled:opacity-30 disabled:hover:bg-zinc-900/80 disabled:hover:text-zinc-100 transition-all duration-300"
                      >
                        {t('bookButton')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal Glassmorphism Refined */}
      <AnimatePresence>
        {showBookingForm && selectedRoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-zinc-900/90 border border-white/[0.08] rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="border-b border-white/[0.06] bg-zinc-950/40 px-8 py-5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-wide text-zinc-100">{t('reserveTitle', { number: selectedRoom?.roomNumber })}</h2>
                  <p className="text-xs text-zinc-400 font-light mt-0.5">{t('reserveSubtitle')}</p>
                </div>
                <button 
                  onClick={() => { setShowBookingForm(false); setSelectedRoom(null); }}
                  className="text-zinc-400 hover:text-zinc-200 text-sm p-1.5 rounded-lg border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="overflow-y-auto p-8 space-y-6">
                
                {/* Embedded dynamic summary */}
                <div className="rounded-xl bg-zinc-950/50 border border-white/[0.04] p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] tracking-widest text-zinc-500 uppercase block font-semibold">{t('selectedSuite')}</span>
                    <span className="text-sm font-medium capitalize text-zinc-200">{selectedRoom.type} Room</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] tracking-widest text-zinc-500 uppercase block font-semibold">{t('rate')}</span>
                    <span className="text-lg font-bold text-amber-400">${selectedRoom.pricePerNight} <span className="text-xs text-zinc-400 font-light">/ {t('night')}</span></span>
                  </div>
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('guestName')}</label>
                    <input
                      type="text"
                      name="guestName"
                      required
                      className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('email')}</label>
                      <input
                        type="email"
                        name="guestEmail"
                        required
                        className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('phone')}</label>
                      <input
                        type="tel"
                        name="guestPhone"
                        required
                        className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition"
                      />
                    </div>
                  </div>
                  <label htmlFor="nationality" className="text-xs font-bold uppercase mb-1">
        {t('nationality')}
      </label>
      
      <select
        id="nationality"
        name="nationality"
        className="border p-2 rounded max-h-40 overflow-y-auto bg-white text-black"
      >
        <option value="">{t('nationalityPlaceholder')}</option>
        {NATIONALITIES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('checkIn')}</label>
                      <input
                        type="date"
                        name="checkIn"
                        required
                        value={checkInDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('checkOut')}</label>
                      <input
                        type="date"
                        name="checkOut"
                        required
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {numberOfNights > 0 && (
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] flex justify-between items-center">
                      <span className="text-xs text-zinc-400 font-light">{t('durationMetrics', { nights: numberOfNights })}</span>
                      <span className="text-md font-semibold text-emerald-400">{t('totalCost', { total: numberOfNights * selectedRoom.pricePerNight })}</span>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('numberOfGuests')}</label>
                    <input
                      type="number"
                      name="numberOfGuests"
                      min="1"
                      max={selectedRoom.maxGuests}
                      required
                      className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('reasonOfStay')}</label>
                    <input
                      type='text'
                      name='reasonOfStay'
                      required
                      className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition"
                      />
                  </div>
                   <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('passportNumber')}</label>
                    <input
                      type='text'
                      name='passportno'
                      
                      className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition"
                      />
                  </div>
                   <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('idNumber')}</label>
                    <input
                      type='text'
                      name='idnumber'
                     
                      className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition"
                      />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">{t('specialRequests')}</label>
                    <textarea
                      name="specialRequests"
                      rows={3}
                      placeholder={t('specialRequestsPlaceholder')}
                      className="w-full bg-zinc-950/40 border border-white/[0.08] text-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition resize-none placeholder:text-zinc-600"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingForm(false);
                        setSelectedRoom(null);
                      }}
                      className="flex-1 rounded-xl border border-white/[0.08] py-3 text-sm text-zinc-300 font-medium hover:bg-white/[0.04] transition"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-amber-500 text-zinc-950 font-semibold py-3 text-sm shadow-xl shadow-amber-500/5 hover:bg-amber-400 transition"
                    >
                      {t('confirmReservation')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}