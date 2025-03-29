
import React from 'react';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

const ApiPage = () => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-white">API Documentation</h1>
          <p className="text-xl text-gray-400 mb-8">
            Integrate ImagiNexus image generation into your applications with our robust API.
          </p>
          
          <div className="space-y-8">
            <div className="bg-imaginexus-darker rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 text-white">Authentication</h2>
              <p className="text-gray-300 mb-4">
                To use the ImagiNexus API, you'll need an API key. You can generate one from your dashboard.
              </p>
              <div className="bg-black rounded p-4 mb-4 relative">
                <code className="text-green-500">
                  Authorization: Bearer YOUR_API_KEY
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  onClick={() => handleCopy("Authorization: Bearer YOUR_API_KEY")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-imaginexus-darker rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 text-white">Generate Image</h2>
              <p className="text-gray-300 mb-4">
                Create a new image from a text prompt.
              </p>
              <div className="bg-black rounded p-4 mb-6 relative">
                <pre className="text-green-500 whitespace-pre-wrap">
                  {`POST /api/v1/images/generate

{
  "prompt": "A futuristic city with flying cars",
  "style": "photographic",
  "aspectRatio": "16:9"
}`}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  onClick={() => handleCopy(`POST /api/v1/images/generate

{
  "prompt": "A futuristic city with flying cars",
  "style": "photographic",
  "aspectRatio": "16:9"
}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-white">Response</h3>
              <div className="bg-black rounded p-4 relative">
                <pre className="text-green-500 whitespace-pre-wrap">
                  {`{
  "id": "img_123456",
  "url": "https://api.imaginexus.com/images/img_123456.png",
  "prompt": "A futuristic city with flying cars",
  "style": "photographic",
  "aspectRatio": "16:9",
  "createdAt": "2023-06-15T10:30:00Z"
}`}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  onClick={() => handleCopy(`{
  "id": "img_123456",
  "url": "https://api.imaginexus.com/images/img_123456.png",
  "prompt": "A futuristic city with flying cars",
  "style": "photographic",
  "aspectRatio": "16:9",
  "createdAt": "2023-06-15T10:30:00Z"
}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-imaginexus-darker rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 text-white">Rate Limits</h2>
              <p className="text-gray-300">
                Different plans have different rate limits:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-300">
                <li>Free: 10 requests per day</li>
                <li>Pro: 100 requests per day</li>
                <li>Business: 1000 requests per day</li>
              </ul>
            </div>

            <div className="text-center mt-12">
              <Button className="gradient-btn text-white px-6 py-2">
                Get API Access
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiPage;
