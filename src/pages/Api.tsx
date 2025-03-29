
import React from 'react';
import Navbar from '../components/Navbar';
import ApiKeyManager from '../components/ApiKeyManager';
import FirebaseConfigManager from '../components/FirebaseConfigManager';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Shield, Server, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const ApiPage = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-imaginexus-accent1 bg-opacity-20 p-3 rounded-lg">
              <Server className="h-6 w-6 text-imaginexus-accent1" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">API & Configuration</h1>
              <p className="text-gray-400 mt-1">Manage your API keys and Firebase configuration</p>
            </div>
          </div>
          
          {!currentUser ? (
            <Card className="bg-imaginexus-darker border-gray-800 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-400"></div>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-imaginexus-accent1" />
                  Authentication Required
                </CardTitle>
                <CardDescription className="text-gray-400">
                  You need to sign in to access API and configuration settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Sign in with Google to access and manage your API keys and Firebase configuration.
                </p>
                <Button 
                  onClick={signInWithGoogle} 
                  className="gradient-btn w-full sm:w-auto flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign In with Google
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="configuration" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-imaginexus-darker border-gray-800 p-1">
                <TabsTrigger 
                  value="configuration" 
                  className="data-[state=active]:bg-imaginexus-accent1 text-white flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configuration
                </TabsTrigger>
                <TabsTrigger 
                  value="api" 
                  className="data-[state=active]:bg-imaginexus-accent1 text-white flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  API Documentation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="configuration" className="space-y-6 focus:outline-none">
                <FirebaseConfigManager />
                <ApiKeyManager />
              </TabsContent>
              
              <TabsContent value="api" className="focus:outline-none">
                <Card className="bg-imaginexus-darker border-gray-800 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-400" /> 
                      API Documentation
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Learn how to integrate with the Imagicaaa API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-medium text-white mt-0 mb-2">Getting Started</h3>
                        <p className="text-gray-300 mb-0">
                          The Imagicaaa API allows you to generate images programmatically using our powerful AI models.
                          Below is a simple example of how to use our API.
                        </p>
                      </div>
                      
                      <div className="bg-black/50 p-4 rounded-md my-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-gray-400">Example API Call</div>
                          <Button variant="outline" size="sm" className="h-7 text-xs border-gray-700 text-gray-300">
                            Copy Code
                          </Button>
                        </div>
                        <pre className="text-gray-300 text-sm overflow-x-auto">
                          <code>{`fetch('https://api.imagicaaa.com/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    prompt: 'A beautiful sunset over mountains',
    style: 'photorealistic',
    aspectRatio: '16:9'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}</code>
                        </pre>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mt-8 mb-4">API Endpoints</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse mb-6">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left p-3 text-gray-300">Endpoint</th>
                              <th className="text-left p-3 text-gray-300">Description</th>
                              <th className="text-left p-3 text-gray-300">Required Plan</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-800">
                              <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-gray-300">/generate</code></td>
                              <td className="p-3 text-gray-300">Generate a new image from a text prompt</td>
                              <td className="p-3"><span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">Free</span></td>
                            </tr>
                            <tr className="border-b border-gray-800">
                              <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-gray-300">/enhance</code></td>
                              <td className="p-3 text-gray-300">Enhance an existing image</td>
                              <td className="p-3"><span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">Basic</span></td>
                            </tr>
                            <tr>
                              <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-gray-300">/analyze</code></td>
                              <td className="p-3 text-gray-300">Analyze an image and get a description</td>
                              <td className="p-3"><span className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded">Pro</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <Separator className="my-8 bg-gray-800" />
                      
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6 bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium m-0">Ready to get started?</h3>
                          <p className="text-gray-400 text-sm m-0">Generate your API key to begin using Imagicaaa API</p>
                        </div>
                        <Link to="/settings">
                          <Button className="gradient-btn flex items-center gap-2 whitespace-nowrap">
                            <Code size={16} />
                            <span>Get Your API Key</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApiPage;
