
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { generateImage, enhancePrompt, GeneratedImage } from '../services/imageService';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const Index = () => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photographic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }
    
    setIsEnhancing(true);
    try {
      const enhancedPrompt = await enhancePrompt(prompt);
      setPrompt(enhancedPrompt);
      toast.success('Prompt enhanced!');
    } catch (error) {
      toast.error('Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }
    
    if (!currentUser) {
      toast.error('Please sign in to generate images');
      return;
    }
    
    setIsGenerating(true);
    try {
      const image = await generateImage(prompt, style, aspectRatio, currentUser.uid);
      setGeneratedImage(image);
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        <section className="py-16 md:py-24 text-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-sm md:text-base text-imaginexus-accent2 mb-2">Welcome to the future of image creation</h2>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6">
              Transform Your Ideas into<br />
              <span className="gradient-text">Stunning Visuals</span>
            </h1>
            <p className="text-gray-300 md:text-lg max-w-3xl mx-auto mb-12">
              Experience the power of AI-driven image generation. Create beautiful, unique visuals
              from your descriptions in seconds.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="space-y-6">
                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    className="min-h-[150px] bg-imaginexus-darker text-white border-gray-800 rounded-md resize-none main-textarea"
                  />
                  <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing || !prompt.trim()}
                      className="text-xs bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-1 h-3 w-3" />
                          Enhance
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-gray-500">{prompt.length}/1000</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="bg-imaginexus-darker border-gray-800 text-white">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-imaginexus-darker border-gray-800">
                        <SelectItem value="photographic">Photographic</SelectItem>
                        <SelectItem value="digital-art">Digital Art</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                        <SelectItem value="3d-render">3D Render</SelectItem>
                        <SelectItem value="pixel-art">Pixel Art</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                    <div className="flex space-x-2">
                      <Button 
                        variant={aspectRatio === "1:1" ? "default" : "outline"} 
                        className={
                          aspectRatio === "1:1" 
                            ? "flex-1 bg-imaginexus-accent1 hover:bg-imaginexus-accent1/90" 
                            : "flex-1 bg-transparent border-gray-700 text-white"
                        }
                        onClick={() => setAspectRatio("1:1")}
                      >
                        1:1
                      </Button>
                      <Button 
                        variant={aspectRatio === "16:9" ? "default" : "outline"} 
                        className={
                          aspectRatio === "16:9" 
                            ? "flex-1 bg-imaginexus-accent1 hover:bg-imaginexus-accent1/90" 
                            : "flex-1 bg-transparent border-gray-700 text-white"
                        }
                        onClick={() => setAspectRatio("16:9")}
                      >
                        16:9
                      </Button>
                      <Button 
                        variant={aspectRatio === "4:3" ? "default" : "outline"} 
                        className={
                          aspectRatio === "4:3" 
                            ? "flex-1 bg-imaginexus-accent1 hover:bg-imaginexus-accent1/90" 
                            : "flex-1 bg-transparent border-gray-700 text-white"
                        }
                        onClick={() => setAspectRatio("4:3")}
                      >
                        4:3
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full gradient-btn text-white py-6 rounded-md"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate Image"}
                </Button>
              </div>
              
              <div className="flex items-center justify-center bg-imaginexus-darker rounded-md p-4 min-h-[350px] border border-gray-800">
                {generatedImage ? (
                  <img 
                    src={generatedImage.imageUrl} 
                    alt={generatedImage.prompt} 
                    className="max-w-full max-h-full object-contain rounded"
                  />
                ) : (
                  <div className="text-center">
                    <svg 
                      className="w-16 h-16 mx-auto mb-4 text-gray-700" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">Your generated image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
