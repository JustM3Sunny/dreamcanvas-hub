
import React from 'react';
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
import { LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { currentUser, signInWithGoogle, signOut } = useAuth();
  
  return (
    <header className="w-full py-4 px-4 md:px-8 bg-imaginexus-darker border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
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
          <span className="text-white text-lg font-semibold">ImagiNexus</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/gallery" className="text-white hover:text-imaginexus-accent1 transition-colors">
            Gallery
          </Link>
          <Link to="/pricing" className="text-white hover:text-imaginexus-accent1 transition-colors">
            Pricing
          </Link>
          <Link to="/api" className="text-white hover:text-imaginexus-accent1 transition-colors">
            API
          </Link>
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} />
                  <AvatarFallback>{currentUser.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-imaginexus-darker border-gray-800">
                <DropdownMenuLabel className="text-white">
                  {currentUser.displayName || currentUser.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer" onClick={() => {}}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={signInWithGoogle} 
              className="bg-white text-imaginexus-dark hover:bg-gray-200 rounded-full px-6"
            >
              Sign In
            </Button>
          )}
        </nav>
        
        {!currentUser && (
          <Button 
            onClick={signInWithGoogle} 
            className="md:hidden bg-white text-imaginexus-dark hover:bg-gray-200 rounded-full px-6"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
