'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react'; // 1. Import signIn from next-auth/react
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.errors.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || t('register.errors.registrationFailed'));
        return;
      }

      setSuccess(t('register.success'));
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      setError(t('register.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 px-4 py-8">
      <div className="bg-zinc-950/95 border border-white/10 rounded-[2rem] shadow-2xl p-10 w-full max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-400 font-semibold">MW Hotel</p>
          <h1 className="text-3xl font-bold text-white mt-4">{t('register.title')}</h1>
          <p className="text-sm text-zinc-400 mt-3">{t('register.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {success}
          </div>
        )}

        {/* 2. Added Google Sign-Up Button */}
        <Button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white py-3 font-semibold transition flex items-center justify-center gap-3 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
           
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
             
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
             
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
             
            />
          </svg>
          Sign up with Google
        </Button>

        {/* Visual Separator */}
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-zinc-500 text-xs tracking-wider uppercase">Or register with email</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">{t('register.firstName')}</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-zinc-800 rounded-2xl bg-zinc-900 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">{t('register.lastName')}</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-zinc-800 rounded-2xl bg-zinc-900 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">{t('register.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-zinc-800 rounded-2xl bg-zinc-900 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={t('register.emailPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">{t('register.phone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-zinc-800 rounded-2xl bg-zinc-900 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={t('register.phonePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">{t('register.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-zinc-800 rounded-2xl bg-zinc-900 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={t('register.passwordPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">{t('register.confirmPassword')}</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-zinc-800 rounded-2xl bg-zinc-900 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={t('register.passwordPlaceholder')}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 font-semibold transition shadow-lg shadow-amber-500/20"
          >
            {loading ? t('register.submitLoading') : t('register.submit')}
          </Button>
        </form>

        <p className="text-sm text-zinc-400 text-center mt-6">
          {t('register.haveAccount')}{' '}
          <Link href="/auth/login" className="text-amber-400 hover:underline">
            {t('register.signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}