'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Moon, Sun, Bell, User, Menu, X, Heart, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/hotels', label: 'Hotels' },
    { href: '/hotels?search=deals', label: 'Deals' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || pathname !== '/' ? 'bg-background/95 backdrop-blur-md border-b shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🏨</span>
          <span className={pathname === '/' && !scrolled ? 'text-white' : 'text-foreground'}>
            Stay<span className="text-amber-500">Wise</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-amber-500 ${
                pathname === '/' && !scrolled ? 'text-white/90' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={pathname === '/' && !scrolled ? 'text-white hover:bg-white/20' : ''}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {user ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}
                className={pathname === '/' && !scrolled ? 'text-white hover:bg-white/20' : ''}>
                <Bell className="w-5 h-5" />
              </Button>

              {/* User Menu */}
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 rounded-full">
                  <Avatar className="w-9 h-9 border-2 border-amber-400">
                    <AvatarImage src={user.avatar || ''} alt={user.name} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-12 w-56 bg-card border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      {[
                        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
                        { icon: Heart, label: 'Wishlist', href: '/dashboard?tab=wishlist' },
                        { icon: Settings, label: 'Settings', href: '/dashboard?tab=settings' },
                        ...(user.role === 'ADMIN' ? [{ icon: Settings, label: 'Admin Panel', href: '/admin' }] : []),
                        ...(user.role === 'HOTEL_OWNER' ? [{ icon: LayoutDashboard, label: 'My Hotels', href: '/owner/dashboard' }] : []),
                      ].map(({ icon: Icon, label, href }) => (
                        <button
                          key={label}
                          onClick={() => { router.push(href); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground" /> {label}
                        </button>
                      ))}
                      <div className="border-t">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push('/auth/login')}
                className={pathname === '/' && !scrolled ? 'text-white hover:bg-white/20' : ''}>
                Log in
              </Button>
              <Button onClick={() => router.push('/auth/register')} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                Sign up
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-b overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className="block py-2 font-medium hover:text-amber-500">
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => { router.push('/auth/login'); setMobileOpen(false); }}>Log in</Button>
                  <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-black" onClick={() => { router.push('/auth/register'); setMobileOpen(false); }}>Sign up</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
