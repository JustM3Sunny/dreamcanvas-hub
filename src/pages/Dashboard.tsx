
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CreditCard, 
  Image as ImageIcon, 
  TrendingUp, 
  Users, 
  Zap 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSubscription } from '../services/imageService';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [userSubscription, setUserSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  React.useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          setIsLoading(true);
          const subscription = await getUserSubscription(currentUser.uid);
          setUserSubscription(subscription);
        } catch (error) {
          console.error("Error loading user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [currentUser]);
  
  // Sample data - would be fetched from API in a real application
  const stats = [
    { name: 'Images Generated', value: '128', icon: ImageIcon },
    { name: 'Credits Remaining', value: '230', icon: CreditCard },
    { name: 'Unique Styles Used', value: '7', icon: Zap },
    { name: 'Account Age', value: '24 days', icon: Calendar }
  ];
  
  const recentActivity = [
    { id: 1, action: 'Generated Image', prompt: 'A futuristic city with flying cars', time: '2 hours ago' },
    { id: 2, action: 'Edited Style', prompt: 'Mountain landscape with sunset', time: '5 hours ago' },
    { id: 3, action: 'Generated Image', prompt: 'Underwater scene with bioluminescent creatures', time: '1 day ago' },
    { id: 4, action: 'Generated Image', prompt: 'Medieval castle on a hill with dragons', time: '2 days ago' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Refresh</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-black border-white/10">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.name}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <stat.icon className="h-10 w-10 text-purple-400 opacity-80" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Your latest image generations and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-4 border-b border-white/5 pb-4">
                  <div className="h-10 w-10 rounded-full bg-purple-800/30 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.action}</p>
                    <p className="text-xs text-gray-400 mt-1">"{item.prompt}"</p>
                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Usage Stats</CardTitle>
            <CardDescription className="text-gray-400">Monthly generation patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Your usage is 23% higher than last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Popular Styles</CardTitle>
            <CardDescription className="text-gray-400">Your most used image styles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Ghibli Style</span>
                <span className="text-sm text-gray-400">43%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full w-[43%]"></div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-300">Photorealistic</span>
                <span className="text-sm text-gray-400">29%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full w-[29%]"></div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-300">Digital Art</span>
                <span className="text-sm text-gray-400">18%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full w-[18%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recommended</CardTitle>
            <CardDescription className="text-gray-400">Try these features to enhance your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-green-800/30 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Upgrade your plan</p>
                  <p className="text-xs text-gray-400 mt-1">Get more daily credits and unlock premium styles</p>
                  <Button className="mt-2 h-8 text-xs bg-gradient-to-r from-indigo-600 to-purple-600" size="sm">View Plans</Button>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-800/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Join the community</p>
                  <p className="text-xs text-gray-400 mt-1">Connect with other creators and share your work</p>
                  <Button className="mt-2 h-8 text-xs" size="sm" variant="outline">Explore Community</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
