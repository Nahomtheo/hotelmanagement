'use client';
import { useTranslations } from 'next-intl'
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function ModernNavbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const user = session?.user;
  const t = useTranslations('nav')

  const links = [
    { key: 'rooms', label: t('links.rooms') },
    { key: 'destinations', label: t('links.destinations') },
    { key: 'offers', label: t('links.offers') },
    { key: 'culture', label: t('links.culture') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      {/* Container with dynamic framer-motion layout handling */}
      <motion.div 
        layout
        className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/60 rounded-2xl shadow-2xl relative"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-wider text-amber-400">
          <span>🇪🇹</span>
          <span>{t('brand')}</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          {links.map((item) => (
            <Link key={item.key} href={`/${item.key}`} className="hover:text-amber-400 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <LanguageSwitcher/>
          {user ? (
            <>
              <span className="text-zinc-400">{t('welcome', { name: user.name as string })}</span>
              <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl" onClick={() => signOut()}>
                {t('signOut')}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">{t('signIn')}</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl px-5">{t('register')}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden flex flex-col gap-1.5 p-2 text-zinc-300 focus:outline-none" aria-label={t('menuLabel')}>
          <motion.span animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-6 h-[2px] bg-current block rounded-full" />
          <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-[2px] bg-current block rounded-full" />
          <motion.span animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="w-6 h-[2px] bg-current block rounded-full" />
        </button>

        {/* Mobile Dropdown Menu via Framer Motion */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute top-full left-0 right-0 mt-3 p-6 bg-zinc-950/95 border border-zinc-800/80 rounded-2xl flex flex-col gap-6 shadow-2xl md:hidden z-50"
            >
              <nav className="flex flex-col gap-4 font-medium text-zinc-300">
                {links.map((item) => (
                  <Link key={item.key} href={`/${item.key}`} onClick={() => setIsOpen(false)} className="py-2 border-b border-zinc-900 hover:text-amber-400 transition-colors">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 pt-2">
                {/* Mobile Language Switcher Placement */}
                <div className="flex justify-center mb-1">
                  <LanguageSwitcher />
                </div>
                
                {user ? (
                  <>
                    <span className="text-zinc-400 text-sm mb-2 text-center">{t('welcome', { name: user.name as string})}</span>
                    <Button className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl py-5" onClick={() => { setIsOpen(false); signOut(); }}>
                      {t('signOut')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="w-full" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full text-zinc-300 hover:bg-white/5 py-5 rounded-xl">{t('signIn')}</Button>
                    </Link>
                    <Link href="/auth/register" className="w-full" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-amber-600 text-white py-5 rounded-xl font-semibold">{t('register')}</Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </header>
  );
}