
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const FirebaseConfigManager = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [config, setConfig] = useState<FirebaseConfig>({
    apiKey: localStorage.getItem('FIREBASE_API_KEY') || '',
    authDomain: localStorage.getItem('FIREBASE_AUTH_DOMAIN') || '',
    projectId: localStorage.getItem('FIREBASE_PROJECT_ID') || '',
    storageBucket: localStorage.getItem('FIREBASE_STORAGE_BUCKET') || '',
    messagingSenderId: localStorage.getItem('FIREBASE_MESSAGING_SENDER_ID') || '',
    appId: localStorage.getItem('FIREBASE_APP_ID') || '',
    measurementId: localStorage.getItem('FIREBASE_MEASUREMENT_ID') || '',
  });

  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    // Check if Firebase configuration exists in localStorage
    const hasStoredConfig = localStorage.getItem('FIREBASE_API_KEY') !== null;
    setHasConfig(hasStoredConfig);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const saveConfig = () => {
    // Validate required fields
    if (!config.apiKey || !config.authDomain || !config.projectId) {
      toast.error("API Key, Auth Domain, and Project ID are required");
      return;
    }

    // Save to localStorage
    Object.entries(config).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(`FIREBASE_${key.toUpperCase()}`, value);
      }
    });

    toast.success("Firebase configuration saved. Please refresh the page.");
    setShowDialog(false);
    setHasConfig(true);
  };

  const clearConfig = () => {
    // Remove from localStorage
    [
      'FIREBASE_API_KEY', 
      'FIREBASE_AUTH_DOMAIN', 
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID',
      'FIREBASE_MEASUREMENT_ID'
    ].forEach(key => localStorage.removeItem(key));
    
    setConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: ''
    });
    
    toast.success("Firebase configuration cleared. Please refresh the page.");
    setHasConfig(false);
  };

  return (
    <Card className="bg-imaginexus-darker border-gray-800 mb-6">
      <CardHeader>
        <CardTitle className="text-white">Firebase Configuration</CardTitle>
        <CardDescription className="text-gray-400">
          Manage your Firebase credentials for authentication, storage, and database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-300 mb-4">
          {hasConfig 
            ? "Firebase configuration is stored in your browser. You can update or clear it below." 
            : "No Firebase configuration found in your browser. Default configuration is being used."}
        </p>
        
        <div className="flex space-x-4">
          <Button 
            onClick={() => setShowDialog(true)}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            {hasConfig ? "Update Configuration" : "Set Configuration"}
          </Button>
          
          {hasConfig && (
            <Button 
              onClick={clearConfig} 
              variant="destructive"
            >
              Clear Configuration
            </Button>
          )}
        </div>
      </CardContent>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-imaginexus-darker border-gray-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Firebase Configuration</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your Firebase project credentials. These will be stored in your browser's local storage.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="apiKey" className="text-sm text-gray-300">API Key *</label>
              <Input 
                id="apiKey" 
                name="apiKey" 
                value={config.apiKey} 
                onChange={handleChange}
                placeholder="AIzaSyB76w..." 
                className="bg-imaginexus-dark border-gray-700"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="authDomain" className="text-sm text-gray-300">Auth Domain *</label>
              <Input 
                id="authDomain" 
                name="authDomain" 
                value={config.authDomain} 
                onChange={handleChange}
                placeholder="your-project.firebaseapp.com" 
                className="bg-imaginexus-dark border-gray-700"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="projectId" className="text-sm text-gray-300">Project ID *</label>
              <Input 
                id="projectId" 
                name="projectId" 
                value={config.projectId} 
                onChange={handleChange}
                placeholder="your-project-id" 
                className="bg-imaginexus-dark border-gray-700"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="storageBucket" className="text-sm text-gray-300">Storage Bucket</label>
              <Input 
                id="storageBucket" 
                name="storageBucket" 
                value={config.storageBucket} 
                onChange={handleChange}
                placeholder="your-project.appspot.com" 
                className="bg-imaginexus-dark border-gray-700"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="messagingSenderId" className="text-sm text-gray-300">Messaging Sender ID</label>
              <Input 
                id="messagingSenderId" 
                name="messagingSenderId" 
                value={config.messagingSenderId} 
                onChange={handleChange}
                placeholder="123456789012" 
                className="bg-imaginexus-dark border-gray-700"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="appId" className="text-sm text-gray-300">App ID</label>
              <Input 
                id="appId" 
                name="appId" 
                value={config.appId} 
                onChange={handleChange}
                placeholder="1:123456789012:web:abc123..." 
                className="bg-imaginexus-dark border-gray-700"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="measurementId" className="text-sm text-gray-300">Measurement ID</label>
              <Input 
                id="measurementId" 
                name="measurementId" 
                value={config.measurementId} 
                onChange={handleChange}
                placeholder="G-ABCDEF123" 
                className="bg-imaginexus-dark border-gray-700"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={saveConfig} className="gradient-btn">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FirebaseConfigManager;
