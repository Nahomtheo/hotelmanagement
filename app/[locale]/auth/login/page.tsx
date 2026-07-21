'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || t('login.errors.invalidCredentials'));
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError(t('login.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 px-4">
      <div className="bg-zinc-950/95 border border-white/10 rounded-[2rem] shadow-2xl p-10 w-full max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-400 font-semibold">MW Hotel</p>
          <h1 className="text-3xl font-bold text-white mt-4">{t('login.title')}</h1>
          <p className="text-sm text-zinc-400 mt-3">{t('login.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">{t('login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-zinc-800 rounded-2xl bg-zinc-900 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">{t('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-zinc-800 rounded-2xl bg-zinc-900 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={t('login.passwordPlaceholder')}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 font-semibold transition shadow-lg shadow-amber-500/20"
          >
            {loading ? t('login.submitLoading') : t('login.submit')}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          <Link href="/auth/forgot-password" className="text-sm text-amber-300 hover:underline block">
            {t('login.forgotPassword')}
          </Link>
          <p className="text-sm text-zinc-400">
            {t('login.noAccount')}{' '}
            <Link href="/auth/register" className="text-amber-300 hover:underline">
              {t('login.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
