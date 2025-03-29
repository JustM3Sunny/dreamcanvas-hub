
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Zap, Upload, Image as ImageIcon } from 'lucide-react';
import { 
  generateImage, 
  enhancePrompt, 
  enhancedImageGeneration, 
  GeneratedImage,
  getUserSubscription,
  getLatestUserImages
} from '../services/imageService';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import SubscriptionInfo from '../components/SubscriptionInfo';

const Index = () => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [qualityLevel, setQualityLevel] = useState('high');
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('text-to-image');
  
  // Fetch user subscription details and recent images
  useEffect(() => {
    async function loadUserData() {
      if (currentUser) {
        try {
          // Get user subscription details
          const subscription = await getUserSubscription(currentUser.uid);
          setUserSubscription(subscription);
          
          // Get recent images
          const images = await getLatestUserImages(currentUser.uid, 4);
          setRecentImages(images);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    }
    
    loadUserData();
  }, [currentUser]);
  
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
  
  const handleGenerateImage = async (useEnhanced = false) => {
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
      let image;
      
      if (useEnhanced) {
        image = await enhancedImageGeneration(prompt, currentUser.uid, {
          quality: qualityLevel as "standard" | "high" | "ultra-high" | "max",
          aspectRatio,
          style,
          detailLevel: "16k"
        });
      } else {
        image = await generateImage(prompt, style, aspectRatio, currentUser.uid);
      }
      
      setGeneratedImage(image);
      
      // Refresh recent images
      const images = await getLatestUserImages(currentUser.uid, 4);
      setRecentImages(images);
      
      // Refresh user subscription to update usage count
      const subscription = await getUserSubscription(currentUser.uid);
      setUserSubscription(subscription);
      
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleImageUploadGeneration = (imageUrl: string, analyzedPrompt: string) => {
    setGeneratedImage({
      imageUrl,
      prompt: analyzedPrompt,
      style: 'auto-detected',
      aspectRatio: '1:1',
      createdAt: Date.now(),
      userId: currentUser?.uid || ''
    });
    
    // Switch to text-to-image tab and set the analyzed prompt
    setActiveTab('text-to-image');
    setPrompt(analyzedPrompt);
  };
  
  const getAvailableStyles = () => {
    if (!userSubscription) return ['photorealistic', 'digital-art', 'illustration'];
    
    switch (userSubscription.tier) {
      case 'FREE':
        return ['photorealistic', 'digital-art', 'illustration'];
      case 'BASIC':
        return ['photorealistic', 'digital-art', 'illustration', '3d-render', 'pixel-art'];
      case 'PRO':
        return ['photorealistic', 'digital-art', 'illustration', '3d-render', 'pixel-art', 'anime', 'ghibli'];
      case 'UNLIMITED':
        return ['photorealistic', 'digital-art', 'illustration', '3d-render', 'pixel-art', 'anime', 'ghibli', 'watercolor', 'oil-painting', 'concept-art'];
      default:
        return ['photorealistic', 'digital-art', 'illustration'];
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
              from your descriptions in seconds with Imagicaaa's state-of-the-art technology.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
              {/* Side panel with subscription info (on large screens) */}
              <div className="hidden lg:block lg:col-span-1">
                {currentUser && userSubscription ? (
                  <SubscriptionInfo userSubscription={userSubscription} />
                ) : (
                  <div className="bg-imaginexus-darker rounded-lg border border-gray-800 p-4 text-center">
                    <h3 className="text-white font-medium mb-2">Sign in to get started</h3>
                    <p className="text-gray-400 text-sm mb-4">Create an account to generate and save images</p>
                    <Button 
                      className="gradient-btn w-full" 
                      onClick={() => useAuth().signInWithGoogle()}
                    >
                      Sign In
                    </Button>
                  </div>
                )}
                
                <div className="mt-4 bg-imaginexus-darker rounded-lg border border-gray-800 p-4">
                  <h3 className="text-white font-medium mb-2">Featured Styles</h3>
                  <div className="space-y-2">
                    <Link to="/styles" className="block hover:bg-gray-800/50 p-2 rounded transition-colors">
                      <span className="text-sm text-gray-300">🎨 Ghibli Animation</span>
                    </Link>
                    <Link to="/styles" className="block hover:bg-gray-800/50 p-2 rounded transition-colors">
                      <span className="text-sm text-gray-300">🖌️ Watercolor Art</span>
                    </Link>
                    <Link to="/styles" className="block hover:bg-gray-800/50 p-2 rounded transition-colors">
                      <span className="text-sm text-gray-300">🎮 Pixel Art</span>
                    </Link>
                  </div>
                  <Link to="/styles" className="block text-center mt-3 text-imaginexus-accent1 text-sm hover:underline">
                    View All Styles
                  </Link>
                </div>
              </div>
              
              {/* Main content area */}
              <div className="lg:col-span-4">
                <Tabs 
                  defaultValue="text-to-image" 
                  className="w-full" 
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList className="bg-imaginexus-darker border-gray-800">
                    <TabsTrigger value="text-to-image" className="data-[state=active]:bg-imaginexus-accent1 text-white">
                      Text to Image
                    </TabsTrigger>
                    <TabsTrigger value="image-to-image" className="data-[state=active]:bg-imaginexus-accent1 text-white">
                      Image to Image
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Text-to-Image Tab */}
                  <TabsContent value="text-to-image">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                {getAvailableStyles().map(styleOption => (
                                  <SelectItem key={styleOption} value={styleOption}>
                                    {styleOption.charAt(0).toUpperCase() + styleOption.slice(1).replace('-', ' ')}
                                  </SelectItem>
                                ))}
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
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Quality Level</label>
                            <Select value={qualityLevel} onValueChange={setQualityLevel}>
                              <SelectTrigger className="bg-imaginexus-darker border-gray-800 text-white">
                                <SelectValue placeholder="Select quality" />
                              </SelectTrigger>
                              <SelectContent className="bg-imaginexus-darker border-gray-800">
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="ultra-high">Ultra High</SelectItem>
                                <SelectItem value="max">Maximum</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Mobile subscription info */}
                        {currentUser && userSubscription && (
                          <div className="lg:hidden mb-4">
                            <SubscriptionInfo userSubscription={userSubscription} />
                          </div>
                        )}
                        
                        <div className="flex space-x-4">
                          <Button 
                            onClick={() => handleGenerateImage(false)}
                            disabled={isGenerating || !prompt.trim() || !currentUser || 
                              (userSubscription && userSubscription.imagesGenerated >= userSubscription.imagesLimit)}
                            className="flex-1 gradient-btn text-white py-6 rounded-md"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : "Generate Image"}
                          </Button>
                          
                          <Button 
                            onClick={() => handleGenerateImage(true)}
                            disabled={isGenerating || !prompt.trim() || !currentUser || 
                              (userSubscription && userSubscription.imagesGenerated >= userSubscription.imagesLimit)}
                            className="flex-1 bg-imaginexus-accent2 hover:bg-imaginexus-accent2/90 text-white py-6 rounded-md"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Zap className="mr-2 h-4 w-4" />
                                Enhanced Generate
                              </>
                            )}
                          </Button>
                        </div>
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
                  </TabsContent>
                  
                  {/* Image-to-Image Tab */}
                  <TabsContent value="image-to-image">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="bg-imaginexus-darker rounded-lg border border-gray-800 p-4 mb-4">
                          <h3 className="text-white font-medium mb-2">Image to Image Generation</h3>
                          <p className="text-gray-300 text-sm mb-4">
                            Upload an image and our AI will analyze it and create a similar image with the option to modify the style.
                          </p>
                          
                          <ImageUploader onImageGenerated={handleImageUploadGeneration} />
                        </div>
                        
                        {/* Mobile subscription info for image-to-image tab */}
                        {currentUser && userSubscription && (
                          <div className="lg:hidden">
                            <SubscriptionInfo userSubscription={userSubscription} />
                          </div>
                        )}
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
                            <Upload 
                              className="w-16 h-16 mx-auto mb-4 text-gray-700" 
                            />
                            <p className="text-gray-500">Upload an image for analysis</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Quick Gallery Preview */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-6">Your Recent Creations</h2>
              
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                {currentUser && recentImages.length > 0 ? (
                  recentImages.map((image) => (
                    <div 
                      key={image.id}
                      className="w-48 h-48 bg-imaginexus-darker rounded-md overflow-hidden flex items-center justify-center border border-gray-800 hover:border-imaginexus-accent1 transition-all"
                    >
                      <img 
                        src={image.imageUrl} 
                        alt={image.prompt} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  Array(4).fill(null).map((_, index) => (
                    <div 
                      key={index}
                      className="w-48 h-48 bg-imaginexus-darker rounded-md overflow-hidden flex items-center justify-center border border-gray-800 hover:border-imaginexus-accent1 transition-all"
                    >
                      <svg 
                        className="w-12 h-12 text-gray-700" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ))
                )}
              </div>
              
              <Link to="/gallery">
                <Button className="bg-transparent border border-imaginexus-accent1 text-white hover:bg-imaginexus-accent1/20">
                  View Full Gallery
                </Button>
              </Link>
            </div>
            
            {/* Technology Overview */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-imaginexus-darker p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">State-of-the-Art AI</h3>
                <p className="text-gray-400">
                  Our platform uses cutting-edge AI technology to generate stunning, high-resolution 
                  images from text descriptions with remarkable accuracy.
                </p>
              </div>
              
              <div className="bg-imaginexus-darker p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Multiple Styles</h3>
                <p className="text-gray-400">
                  Choose from multiple artistic styles including Ghibli animation, photorealistic renders, 
                  digital art, illustrations, 3D renders, and more.
                </p>
              </div>
              
              <div className="bg-imaginexus-darker p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Image Analysis</h3>
                <p className="text-gray-400">
                  Upload your own images and our AI will analyze them to create similar images 
                  or transform them into different artistic styles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
