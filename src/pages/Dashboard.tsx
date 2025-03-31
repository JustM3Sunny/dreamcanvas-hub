import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { UserLimit } from '../services/imageService';
import SubscriptionInfo from '../components/SubscriptionInfo';
import {
  BarChart,
  LayoutDashboard,
  Image as ImageIcon,
  Zap,
  Sparkles,
  Plus,
  Palette,
  History,
  Settings2
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  // Mock user limit data
  const userLimit: UserLimit = {
    tier: 'BASIC',
    imagesGenerated: 15,
    imagesLimit: 50,
    lastRefresh: new Date().toISOString(),
    ghibliImagesGenerated: 3,
    ghibliImagesLimit: 5,
  };
  
  // Mock recent generations data
  const recentGenerations = [
    { id: 1, prompt: "A beautiful sunset over mountains", date: new Date(), style: "Realistic" },
    { id: 2, prompt: "Cyberpunk city with neon lights", date: new Date(), style: "Futuristic" },
    { id: 3, prompt: "Forest landscape with a small cabin", date: new Date(), style: "Ghibli" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'}</h1>
          <p className="text-gray-400">Manage your AI image generation and explore your creative possibilities</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Stats and Actions */}
        <div className="space-y-6">
          <SubscriptionInfo userLimit={userLimit} />
          
          <Card className="border-white/10 bg-imaginexus-darker shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-white/10 bg-white/5 hover:bg-white/10">
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate New Image
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/10 bg-white/5 hover:bg-white/10">
                <Sparkles className="mr-2 h-4 w-4" />
                Ghibli Generator
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/10 bg-white/5 hover:bg-white/10">
                <Settings2 className="mr-2 h-4 w-4" />
                Customize Settings
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Center and right columns - Recent activity and Stats */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/10 bg-imaginexus-darker shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Recent Generations</CardTitle>
                <CardDescription className="text-gray-400">Your latest image creations</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10">
                <History className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGenerations.map(gen => (
                  <div key={gen.id} className="flex items-start p-3 rounded-lg border border-white/5 bg-white/5">
                    <div className="h-10 w-10 rounded bg-primary/20 flex items-center justify-center mr-3">
                      <Palette size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{gen.prompt}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400">{gen.date}</span>
                        <span className="mx-2 text-gray-600">•</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300">{gen.style}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-2 border-dashed border-white/20 bg-transparent hover:bg-white/5">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Image
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-white/10 bg-imaginexus-darker shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">{userLimit.imagesGenerated}</CardTitle>
                <CardDescription className="text-gray-400">Images Generated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ImageIcon size={18} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-imaginexus-darker shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">{userLimit.ghibliImagesGenerated}</CardTitle>
                <CardDescription className="text-gray-400">Ghibli Images</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-imaginexus-darker shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Basic</CardTitle>
                <CardDescription className="text-gray-400">Current Plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Zap size={18} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
