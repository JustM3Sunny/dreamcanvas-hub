
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image, 
  Settings, 
  Code, 
  GalleryVertical, 
  Palette, 
  Users,
  MessageSquare,
  FileText,
  LifeBuoy,
  Mountain
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Image, label: 'Gallery', path: '/gallery' },
    { icon: GalleryVertical, label: 'Ghibli Studio', path: '/ghibli' },
    { icon: Palette, label: 'Image Styles', path: '/styles' },
    { icon: Code, label: 'API Access', path: '/api' },
    { icon: FileText, label: 'Templates', path: '/templates' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: MessageSquare, label: 'Support', path: '/support' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];
  
  return (
    <aside className="fixed left-0 top-[61px] h-[calc(100vh-61px)] w-64 bg-imaginexus-darker border-r border-white/10 hidden md:block overflow-y-auto scrollbar-none z-40">
      <div className="p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-4">Main Menu</p>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-8 p-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent2/20 border border-white/10">
          <p className="text-sm font-medium text-white">Need help?</p>
          <p className="text-xs text-gray-300 mt-1">Contact our support team for assistance</p>
          <Link to="/support" className="mt-3 text-xs text-primary hover:underline flex items-center">
            <LifeBuoy size={14} className="mr-1" /> Get Support
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
