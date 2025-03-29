
import React from 'react';
import Navbar from '../components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import ApiKeyManager from '../components/ApiKeyManager';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-imaginexus-dark">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Sign In to Access Settings</h2>
          <p className="text-gray-300 mb-6">You need to sign in to view and manage your settings.</p>
          <Link to="/">
            <Button className="gradient-btn text-white px-8 py-6">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
        
        <Tabs defaultValue="api-keys" className="w-full max-w-4xl mx-auto">
          <TabsList className="bg-imaginexus-darker border border-gray-800 p-1 mb-8">
            <TabsTrigger value="api-keys" className="data-[state=active]:bg-imaginexus-accent1 text-white">
              API Keys
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-imaginexus-accent1 text-white">
              Account
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-imaginexus-accent1 text-white">
              Preferences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-keys" className="mt-0">
            <ApiKeyManager />
          </TabsContent>
          
          <TabsContent value="account" className="mt-0">
            <div className="bg-imaginexus-darker border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-medium text-white mb-4">Account Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-md border border-gray-800">
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{currentUser.email}</p>
                  </div>
                  
                  <div className="bg-gray-900/50 p-4 rounded-md border border-gray-800">
                    <p className="text-gray-400 text-sm">Display Name</p>
                    <p className="text-white">{currentUser.displayName || "Not set"}</p>
                  </div>
                  
                  <div className="bg-gray-900/50 p-4 rounded-md border border-gray-800">
                    <p className="text-gray-400 text-sm">Account ID</p>
                    <p className="text-white truncate">{currentUser.uid}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-lg font-medium text-white mb-2">Danger Zone</h3>
                  <p className="text-gray-400 mb-4">These actions cannot be undone.</p>
                  
                  <div className="flex space-x-4">
                    <Button 
                      variant="destructive"
                      className="bg-red-900/50 hover:bg-red-800 border border-red-800"
                    >
                      Delete Account
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-gray-700 text-white"
                    >
                      Reset API Keys
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-0">
            <div className="bg-imaginexus-darker border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-medium text-white mb-4">User Preferences</h2>
              <p className="text-gray-300">Preference settings coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
