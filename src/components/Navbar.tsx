
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Menu, 
  X, 
  Home, 
  Image, 
  Palette,
  PanelRight,
  GalleryVertical,
  LayoutDashboard
} from 'lucide-react';

const Navbar = () => {
  const { currentUser, signInWithGoogle, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full py-3 px-4 md:px-6 bg-black border-b border-white/5 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path 
              d="M12 2L4 7V17L12 22L20 17V7L12 2Z" 
              stroke="url(#gradient)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <circle 
              cx="12" 
              cy="12" 
              r="3" 
              stroke="url(#gradient)" 
              strokeWidth="2" 
            />
            <defs>
              <linearGradient id="gradient" x1="4" y1="12" x2="20" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9b87f5" />
                <stop offset="1" stopColor="#33C3F0" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white text-xl font-bold">Imagicaaa</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/gallery" className="text-gray-300 hover:text-white transition-colors">
            Gallery
          </Link>
          <Link to="/ghibli" className="text-gray-300 hover:text-white transition-colors">
            Ghibli
          </Link>
          <Link to="/features" className="text-gray-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </Link>
          
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                    <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} />
                    <AvatarFallback className="bg-primary text-white">{currentUser.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-white/10">
                  <DropdownMenuLabel className="text-white">
                    {currentUser.displayName || currentUser.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="text-gray-300 hover:bg-white/5 cursor-pointer" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-white/5 cursor-pointer" asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="text-gray-300 hover:bg-white/5 cursor-pointer" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button 
              onClick={signInWithGoogle} 
              className="bg-gradient-primary hover:opacity-90 text-white rounded-md px-6"
            >
              Sign In
            </Button>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 mr-4 cursor-pointer ring-2 ring-primary/20">
                  <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} />
                  <AvatarFallback className="bg-primary text-white">{currentUser.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black border-white/10">
                <DropdownMenuLabel className="text-white">
                  {currentUser.displayName || currentUser.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-gray-300 hover:bg-white/5 cursor-pointer" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:bg-white/5 cursor-pointer" asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-gray-300 hover:bg-white/5 cursor-pointer" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <button 
            type="button" 
            className="text-gray-300 hover:text-white transition-colors" 
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[61px] z-40 bg-black border-t border-white/5">
            <div className="flex flex-col p-4 space-y-4">
              <Link 
                to="/gallery" 
                className="flex items-center gap-3 text-gray-300 p-2 rounded-md hover:bg-white/5 hover:text-white"
                onClick={toggleMobileMenu}
              >
                <Image size={20} />
                <span>Gallery</span>
              </Link>
              <Link 
                to="/ghibli" 
                className="flex items-center gap-3 text-gray-300 p-2 rounded-md hover:bg-white/5 hover:text-white"
                onClick={toggleMobileMenu}
              >
                <GalleryVertical size={20} />
                <span>Ghibli</span>
              </Link>
              <Link 
                to="/features" 
                className="flex items-center gap-3 text-gray-300 p-2 rounded-md hover:bg-white/5 hover:text-white"
                onClick={toggleMobileMenu}
              >
                <Palette size={20} />
                <span>Features</span>
              </Link>
              <Link 
                to="/pricing" 
                className="flex items-center gap-3 text-gray-300 p-2 rounded-md hover:bg-white/5 hover:text-white"
                onClick={toggleMobileMenu}
              >
                <PanelRight size={20} />
                <span>Pricing</span>
              </Link>
              
              {!currentUser && (
                <Button 
                  onClick={() => {
                    signInWithGoogle();
                    toggleMobileMenu();
                  }}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white rounded-md"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
