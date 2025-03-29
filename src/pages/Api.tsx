
import React from 'react';
import Navbar from '../components/Navbar';
import ApiKeyManager from '../components/ApiKeyManager';
import FirebaseConfigManager from '../components/FirebaseConfigManager';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApiPage = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-white">API & Configuration</h1>
          
          {!currentUser ? (
            <Card className="bg-imaginexus-darker border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Authentication Required</CardTitle>
                <CardDescription className="text-gray-400">
                  You need to sign in to access API and configuration settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => useAuth().signInWithGoogle()} className="gradient-btn">
                  Sign In with Google
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="configuration" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-imaginexus-darker border-gray-800">
                <TabsTrigger value="configuration" className="data-[state=active]:bg-imaginexus-accent1 text-white">
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="api" className="data-[state=active]:bg-imaginexus-accent1 text-white">
                  API Documentation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="configuration" className="space-y-6">
                <FirebaseConfigManager />
                <ApiKeyManager />
              </TabsContent>
              
              <TabsContent value="api">
                <Card className="bg-imaginexus-darker border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">API Documentation</CardTitle>
                    <CardDescription className="text-gray-400">
                      Learn how to integrate with the Imagicaaa API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p>
                        The Imagicaaa API allows you to generate images programmatically using our powerful AI models.
                        Below is a simple example of how to use our API.
                      </p>
                      
                      <div className="bg-gray-900 p-4 rounded-md my-4">
                        <pre className="text-gray-300 text-sm overflow-auto">
                          <code>{`// Example API Call
fetch('https://api.imagicaaa.com/generate', {
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
                      
                      <h3 className="text-xl font-semibold text-white mt-6">API Endpoints</h3>
                      
                      <table className="w-full border-collapse my-4">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left p-2">Endpoint</th>
                            <th className="text-left p-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-800">
                            <td className="p-2"><code>/generate</code></td>
                            <td className="p-2">Generate a new image from a text prompt</td>
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="p-2"><code>/enhance</code></td>
                            <td className="p-2">Enhance an existing image</td>
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="p-2"><code>/analyze</code></td>
                            <td className="p-2">Analyze an image and get a description</td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div className="mt-6">
                        <Link to="/settings">
                          <Button className="flex items-center gap-2">
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
