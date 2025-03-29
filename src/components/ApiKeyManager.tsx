
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Key, Eye, EyeOff, Save, Trash2 } from 'lucide-react';

interface ApiKey {
  name: string;
  key: string;
  description: string;
}

const API_KEYS_STORAGE_KEY = 'imagicaaa_api_keys';

const ApiKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  
  // Load saved API keys from localStorage on component mount
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  }, []);
  
  // Save API keys to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  }, [apiKeys]);
  
  const handleAddKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter an API key name');
      return;
    }
    
    if (!newKeyValue.trim()) {
      toast.error('Please enter an API key value');
      return;
    }
    
    // Add the new API key
    setApiKeys(prev => ({
      ...prev,
      [newKeyName.trim()]: newKeyValue.trim()
    }));
    
    // Reset form
    setNewKeyName('');
    setNewKeyValue('');
    toast.success(`API key "${newKeyName}" added successfully`);
  };
  
  const handleRemoveKey = (keyName: string) => {
    const updatedKeys = { ...apiKeys };
    delete updatedKeys[keyName];
    setApiKeys(updatedKeys);
    toast.success(`API key "${keyName}" removed`);
  };
  
  const predefinedKeys = [
    { 
      name: 'GEMINI_API_KEY', 
      key: 'gemini_api_key',
      description: 'Required for image analysis and prompt enhancement'
    },
    {
      name: 'OPENAI_API_KEY',
      key: 'openai_api_key',
      description: 'Alternative AI provider for image generation'
    }
  ];
  
  return (
    <Card className="bg-imaginexus-darker border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Key className="mr-2 h-5 w-5" /> API Keys Manager
        </CardTitle>
        <CardDescription className="text-gray-300">
          Securely manage your API keys for various services
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-900/50 p-3 rounded-md border border-gray-800">
          <p className="text-amber-400 text-sm mb-2">⚠️ Security Notice</p>
          <p className="text-gray-300 text-sm">
            API keys are stored in your browser's local storage. 
            They are only accessible on this device and are not sent to our servers.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white text-sm font-medium">Your API Keys</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-gray-300 hover:text-white"
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showKeys ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {Object.keys(apiKeys).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(apiKeys).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between p-2 bg-gray-900/30 rounded border border-gray-800">
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="text-xs text-gray-400 truncate w-56">
                      {showKeys ? value : '•'.repeat(Math.min(20, value.length))}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveKey(name)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-900/30 rounded border border-gray-800">
              <p className="text-gray-400 text-sm">No API keys added yet</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-800 pt-4">
          <h3 className="text-white text-sm font-medium mb-3">Add New API Key</h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="key-name" className="text-gray-300">Key Name</Label>
              <div>
                <select
                  id="key-name"
                  className="w-full bg-imaginexus-dark border border-gray-700 rounded-md p-2 text-white"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                >
                  <option value="" disabled>Select a key type...</option>
                  {predefinedKeys.map(key => (
                    <option key={key.key} value={key.name}>{key.name}</option>
                  ))}
                  <option value="CUSTOM">Custom Key...</option>
                </select>
              </div>
              {newKeyName === 'CUSTOM' && (
                <Input
                  id="custom-key-name"
                  placeholder="Enter custom key name"
                  className="bg-imaginexus-dark border-gray-700 text-white"
                  value={newKeyName === 'CUSTOM' ? '' : newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              )}
              
              {newKeyName && predefinedKeys.find(k => k.name === newKeyName) && (
                <p className="text-xs text-gray-400">
                  {predefinedKeys.find(k => k.name === newKeyName)?.description}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="key-value" className="text-gray-300">API Key</Label>
              <Input
                id="key-value"
                type={showKeys ? "text" : "password"}
                placeholder="Enter your API key"
                className="bg-imaginexus-dark border-gray-700 text-white"
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full gradient-btn" 
              onClick={handleAddKey}
              disabled={!newKeyName || !newKeyValue || newKeyName === 'CUSTOM'}
            >
              <Save className="mr-2 h-4 w-4" />
              Save API Key
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;
