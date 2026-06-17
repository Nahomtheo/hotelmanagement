'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Hotel Booking</h1>
          <p className="text-xl text-gray-600 mb-8">Find and book your perfect hotel room with ease</p>
          
          <div className="flex justify-center gap-4">
            <Link href="/auth/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600">
                Register
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🏨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Rooms</h3>
            <p className="text-gray-600">Browse our selection of comfortable and well-equipped rooms</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Booking</h3>
            <p className="text-gray-600">Simple and secure booking process with instant confirmation</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Great Reviews</h3>
            <p className="text-gray-600">Read reviews from guests and share your experience</p>
          </div>
        </div>
      </div>
    </main>
  );
}
