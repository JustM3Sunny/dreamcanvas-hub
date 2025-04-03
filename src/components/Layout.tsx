
import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Menu, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="flex">
        {currentUser && (
          <>
            {/* Mobile sidebar (drawer style) */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed inset-0 z-40"
                >
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                       onClick={() => setSidebarOpen(false)} />
                  <div className="relative z-50 h-full w-64 bg-black border-r border-white/5">
                    <Sidebar closeSidebar={() => setSidebarOpen(false)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Desktop sidebar (hidden by default) */}
            <motion.div 
              className="hidden md:block"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: sidebarOpen ? 256 : 0, opacity: sidebarOpen ? 1 : 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="w-64 h-[calc(100vh-61px)] bg-black border-r border-white/5">
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
        
        <main className="flex-1">
          <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
            {currentUser && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="mb-4 text-white hover:bg-white/10"
              >
                {sidebarOpen ? <PanelLeft /> : <Menu />}
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
