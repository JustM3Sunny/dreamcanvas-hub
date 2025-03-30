
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  getUsageStatistics,
  UsageStats
} from '../services/imageService';
import { 
  ImageIcon, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Loader2,
  PieChart as PieChartIcon,
  ListFilter,
  FileText,
  User,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'];

const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authorized before loading data
    if (!currentUser || !isAdmin()) {
      navigate('/');
      toast.error('Unauthorized access');
      return;
    }
    
    loadUsageStats();
  }, [currentUser]);
  
  const isAdmin = () => {
    // In a real app, we would check admin status from Firebase auth claims
    // This is just a simple check based on email
    if (!currentUser) return false;
    return currentUser.email?.endsWith('@admin.com') || 
           currentUser.email === 'admin@imaginexus.com' ||
           currentUser.uid === 'your-admin-uid';
  };
  
  const loadUsageStats = async () => {
    setLoading(true);
    try {
      const stats = await getUsageStatistics();
      setUsageStats(stats);
    } catch (error) {
      console.error('Error loading usage statistics:', error);
      toast.error('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };
  
  const prepareStyleData = () => {
    if (!usageStats) return [];
    
    return Object.entries(usageStats.styleBreakdown).map(([style, count]) => ({
      name: style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' '),
      value: count
    }));
  };
  
  const preparePromptTermData = () => {
    if (!usageStats) return [];
    
    return usageStats.popularPromptTerms.map(({ term, count }) => ({
      name: term,
      value: count
    }));
  };
  
  if (!currentUser || !isAdmin()) {
    return null; // Prevent rendering if not authorized
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Monitor usage statistics and manage your application</p>
          </div>
          
          <Button 
            variant="outline" 
            className="border-gray-700 text-white hover:bg-gray-800"
            onClick={loadUsageStats}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Images" 
            value={usageStats?.totalGenerated || 0}
            description="Images generated"
            icon={<ImageIcon className="h-5 w-5" />}
            loading={loading}
          />
          
          <StatsCard 
            title="Active Users" 
            value={usageStats?.userCount || 0}
            description="Unique users"
            icon={<Users className="h-5 w-5" />}
            loading={loading}
          />
          
          <StatsCard 
            title="Avg. per User" 
            value={usageStats ? Math.round(usageStats.averagePerUser * 10) / 10 : 0}
            description="Images per user"
            icon={<User className="h-5 w-5" />}
            loading={loading}
          />
          
          <StatsCard 
            title="Popular Styles" 
            value={usageStats ? Object.keys(usageStats.styleBreakdown).length : 0}
            description="Different styles used"
            icon={<ListFilter className="h-5 w-5" />}
            loading={loading}
          />
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-imaginexus-darker border-gray-800 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-imaginexus-accent1 text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="styles" className="data-[state=active]:bg-imaginexus-accent1 text-white">
              Style Analytics
            </TabsTrigger>
            <TabsTrigger value="prompts" className="data-[state=active]:bg-imaginexus-accent1 text-white">
              Prompt Terms
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-imaginexus-accent1 text-white">
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-gray-800 bg-imaginexus-darker">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Image Generation Trend</CardTitle>
                    <BarChart3 className="h-5 w-5 text-imaginexus-accent1" />
                  </div>
                  <CardDescription className="text-gray-400">Usage over time</CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-60">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={[
                          { name: 'Day 1', value: 40 },
                          { name: 'Day 2', value: 65 },
                          { name: 'Day 3', value: 55 },
                          { name: 'Day 4', value: 85 },
                          { name: 'Day 5', value: 78 },
                          { name: 'Day 6', value: 90 },
                          { name: 'Day 7', value: 110 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1A1F2C', 
                            borderColor: '#333',
                            color: 'white' 
                          }} 
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="Images Generated"
                          stroke="#9b87f5" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border-gray-800 bg-imaginexus-darker">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">User Activity</CardTitle>
                    <Users className="h-5 w-5 text-imaginexus-accent2" />
                  </div>
                  <CardDescription className="text-gray-400">Weekly active users</CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-60">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { name: 'Mon', users: 12 },
                          { name: 'Tue', users: 19 },
                          { name: 'Wed', users: 15 },
                          { name: 'Thu', users: 23 },
                          { name: 'Fri', users: 28 },
                          { name: 'Sat', users: 35 },
                          { name: 'Sun', users: 30 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1A1F2C', 
                            borderColor: '#333',
                            color: 'white' 
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="users" name="Active Users" fill="#33C3F0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="styles">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-gray-800 bg-imaginexus-darker">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Style Distribution</CardTitle>
                    <PieChartIcon className="h-5 w-5 text-imaginexus-accent1" />
                  </div>
                  <CardDescription className="text-gray-400">Popularity of different styles</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-60">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={prepareStyleData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareStyleData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1A1F2C', 
                            borderColor: '#333',
                            color: 'white' 
                          }} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border-gray-800 bg-imaginexus-darker">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Style Usage Comparison</CardTitle>
                    <BarChart3 className="h-5 w-5 text-imaginexus-accent2" />
                  </div>
                  <CardDescription className="text-gray-400">Count by style</CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-60">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={prepareStyleData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis type="number" stroke="#888" />
                        <YAxis dataKey="name" type="category" width={100} stroke="#888" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1A1F2C', 
                            borderColor: '#333',
                            color: 'white' 
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="value" name="Count" fill="#9b87f5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="prompts">
            <Card className="border-gray-800 bg-imaginexus-darker">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Popular Prompt Terms</CardTitle>
                  <FileText className="h-5 w-5 text-imaginexus-accent1" />
                </div>
                <CardDescription className="text-gray-400">Most used words in prompts</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                {loading ? (
                  <div className="flex items-center justify-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={preparePromptTermData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1F2C', 
                          borderColor: '#333',
                          color: 'white' 
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="value" name="Occurrences" fill="#33C3F0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="border-gray-800 bg-imaginexus-darker">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <ShieldAlert className="h-5 w-5 text-imaginexus-accent1" />
                </div>
                <CardDescription className="text-gray-400">Manage API keys and permissions</CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-4">
                <div className="space-y-6">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="text-white mb-2 font-medium">Firebase Security Rules</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      Make sure your Firestore security rules are properly set to protect user data.
                    </p>
                    
                    <div className="bg-black/50 p-3 rounded text-xs font-mono text-gray-300 mb-3">
                      <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userLimits/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
    match /images/{imageId} {
      allow read: if true; // Public gallery
      allow write: if request.auth != null;
      allow delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId || request.auth.token.admin == true);
    }
    match /analytics/{docId} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow write: if request.auth != null;
    }
  }
}`}</pre>
                    </div>
                    
                    <Button 
                      variant="outline"
                      className="border-gray-700 text-white hover:bg-gray-700/50 w-full"
                      onClick={() => window.open('https://console.firebase.google.com', '_blank')}
                    >
                      Open Firebase Console
                    </Button>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="text-white mb-2 font-medium">Required Firestore Indexes</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      Create these composite indexes to ensure queries work correctly.
                    </p>
                    
                    <div className="bg-black/50 p-3 rounded text-xs font-mono text-gray-300 mb-3">
                      <pre>{`Collection: images
Fields:
- userId (Ascending)
- createdAt (Descending)

Collection: images
Fields:
- style (Ascending)
- createdAt (Descending)`}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t border-gray-800 py-6">
        <div className="container px-4 md:px-6 text-center text-gray-500">
          <p>© 2023 Imagicaaa. Admin Dashboard</p>
        </div>
      </footer>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, loading }) => {
  return (
    <Card className="border-gray-800 bg-imaginexus-darker">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm">{title}</h3>
          <div className="bg-gray-800/50 p-2 rounded-full">
            {icon}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center h-9">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Admin;
