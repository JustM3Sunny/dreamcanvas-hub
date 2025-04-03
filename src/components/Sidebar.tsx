
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image, 
  Settings, 
  GalleryVertical, 
  Palette, 
  Users,
  MessageSquare,
  FileText,
  LifeBuoy,
  CreditCard,
  X
} from 'lucide-react';

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Image, label: 'Gallery', path: '/gallery' },
    { icon: Palette, label: 'Image Styles', path: '/styles' },
    { icon: CreditCard, label: 'Pricing', path: '/pricing' },
    { icon: FileText, label: 'Templates', path: '/templates' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: MessageSquare, label: 'Support', path: '/support' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];
  
  return (
    <aside className="h-full overflow-y-auto scrollbar-none">
      <div className="p-4 flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Main Menu</p>
        {closeSidebar && (
          <button onClick={closeSidebar} className="text-gray-500 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>
      
      <nav className="space-y-1 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive(item.path) 
                ? 'bg-white/10 text-white font-medium' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-8 p-4 mx-3 rounded-lg bg-gradient-to-br from-slate-800 to-black border border-white/5">
        <p className="text-sm font-medium text-white">Need help?</p>
        <p className="text-xs text-gray-400 mt-1">Contact our support team for assistance</p>
        <Link to="/support" 
              onClick={closeSidebar}
              className="mt-3 text-xs text-blue-400 hover:underline flex items-center">
          <LifeBuoy size={14} className="mr-1" /> Get Support
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
