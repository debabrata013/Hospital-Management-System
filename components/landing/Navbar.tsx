"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Globe, User as UserIcon, MenuIcon } from 'lucide-react';
import { AuthState } from '@/lib/types';

// Define the types for the props
interface NavTranslations {
  home: string;
  about: string;
  contact: string;
  login: string;
}

interface NavbarProps {
  t: { 
    hospitalName: string;
    nav: NavTranslations;
  };
  language: string;
  toggleLanguage: () => void;
  authState: AuthState;
  logout: () => void;
}

export const Navbar = ({ t, language, toggleLanguage, authState, logout }: NavbarProps) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">{t.hospitalName}</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-gray-700 hover:text-pink-500 transition-colors font-medium">
              {t.nav.home}
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-pink-500 transition-colors font-medium">
              {t.nav.about}
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-pink-500 transition-colors font-medium">
              {t.nav.contact}
            </Link>
            <Button 
              onClick={toggleLanguage}
              variant="outline" 
              size="sm"
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'hindi' ? 'English' : 'हिंदी'}
            </Button>
            {authState.isAuthenticated && authState.user ? (
              <div className="flex items-center space-x-4">
                <Link href={`/${authState.user.role}`}>
                  <Button variant="outline" className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={logout} className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  {t.nav.login}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
