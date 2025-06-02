'use client';

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';
import { 
  Home, 
  Briefcase, 
  User as UserIcon, 
  LogOut,
  Brain,
  Settings,
  ChevronDown
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
          // Only redirect to dashboard if user is not already on a protected route
          // This prevents unwanted redirections when switching browser tabs
          const isOnProtectedRoute = pathname?.startsWith('/dashboard') || 
                                   pathname?.startsWith('/workspace') ||
                                   pathname?.startsWith('/protected');
          
          if (!isOnProtectedRoute) {
            router.push('/dashboard');
          }
        }
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isAuthPage = pathname?.startsWith('/auth');
  const isLandingPage = pathname === '/';
  const showNavbar = user && !isAuthPage && !isLandingPage;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-9 mx-auto ">
            <div className="flex justify-between items-center h-16">
              {/* Logo and main nav */}
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                   Notion AI
                  </span>
                </Link>
                
                
                
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-4">
                <div className="relative hidden md:flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
                        <UserIcon className="h-4 w-4" />
                        <span>{user?.email}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Brain className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={showNavbar ? "min-h-[calc(100vh-4rem)]" : "min-h-screen"}>
        {children}
      </main>
    </div>
  );
} 