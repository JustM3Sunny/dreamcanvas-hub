
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="flex">
        {currentUser && <Sidebar />}
        
        <main className={`flex-1 p-4 md:p-6 ${currentUser ? 'ml-0 md:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
