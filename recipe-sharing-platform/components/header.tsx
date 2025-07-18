'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SupabaseStatusBadge from '@/components/supabase-status-badge';
import { createClient } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm relative">
      <SupabaseStatusBadge />
      <nav className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          {/* SVG Logo: Bowl of Noodles */}
          <span className="inline-block">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Bowl */}
              <ellipse cx="16" cy="24" rx="10" ry="4" fill="#F59E42" />
              <path d="M6 20c0 4.418 4.477 8 10 8s10-3.582 10-8" fill="#F59E42" stroke="#e76f51" strokeWidth="1.5" />
              {/* Noodles */}
              <path d="M11 18c1.5-2 8.5-2 10 0" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" />
              <path d="M13 16c1-1 5-1 6 0" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" />
              <path d="M15 14c.5-.5 2.5-.5 3 0" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" />
              {/* Chopsticks */}
              <path d="M21 8l5 10" stroke="#8D5524" strokeWidth="2" strokeLinecap="round" />
              <path d="M25 7l-4 11" stroke="#8D5524" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-extrabold text-2xl text-gray-900">RecipeShare</span>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated === null ? null : isAuthenticated ? (
            <>
              {pathname !== '/dashboard' && (
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">Dashboard</Link>
              )}
              {pathname !== '/dashboard/profile' && (
                <Link href="/dashboard/profile" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">Profile</Link>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 font-medium transition-colors"
                type="button"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">Login</Link>
              <Link href="/login?mode=signup" className="bg-black text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}