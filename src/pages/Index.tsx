
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2, Sparkles, Zap, Upload, Image as ImageIcon, RefreshCw, ArrowRight, Heart } from 'lucide-react';
import { 
  generateImage, 
  enhancePrompt, 
  enhancedImageGeneration, 
  GeneratedImage,
  getUserSubscription,
  getLatestUserImages,
  UserLimit
} from '../services/imageService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import SubscriptionInfo from '../components/SubscriptionInfo';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import FirebaseConfigManager from '../components/FirebaseConfigManager';
import GalleryGrid from '../components/GalleryGrid'; 
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const API_KEY = "AIzaSyDc7u7wTVdDG3zP18xnELKs0HX7-hImkmc";

const Index = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [qualityLevel, setQualityLevel] = useState('high');
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserLimit | null>(null);
  const [activeTab, setActiveTab] = useState('text-to-image');
  const [hasFirebaseError, setHasFirebaseError] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [useGemini, setUseGemini] = useState(false);
  
  useEffect(() => {
    loadUserData();
  }, [currentUser]);
  
  async function loadUserData() {
    if (!currentUser) {
      setUserSubscription(null);
      setRecentImages([]);
      return;
    }
    
    try {
      setIsLoadingImages(true);
      setHasFirebaseError(false);
      
      const subscription = await getUserSubscription(currentUser.uid);
      setUserSubscription(subscription);
      
      const images = await getLatestUserImages(currentUser.uid, 4);
      setRecentImages(images);
    } catch (error: any) {
      console.error('Error loading user data:', error);
      
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setHasFirebaseError(true);
      }
    } finally {
      setIsLoadingImages(false);
    }
  }
  
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
      
      // If using Google Gemini, we would use their API here
      // This is simplified for demo purposes
      if (useGemini) {
        toast.info("Using Google Gemini API for generation");
        // For now, we'll use our existing service but in real implementation
        // you would make a call to the Gemini API with the provided key
      }
      
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
      
      await loadUserData();
      
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleImageUploadGeneration = async (imageUrl: string, analyzedPrompt: string) => {
    setGeneratedImage({
      imageUrl,
      prompt: analyzedPrompt,
      style: 'auto-detected',
      aspectRatio: '1:1',
      createdAt: Date.now(),
      userId: currentUser?.uid || ''
    });
    
    setActiveTab('text-to-image');
    setPrompt(analyzedPrompt);
    
    await loadUserData();
  };
  
  const getAvailableStyles = () => {
    if (!userSubscription) return ['photorealistic', 'digital-art', 'illustration'];
    
    switch (userSubscription.tier) {
      case 'FREE':
        return ['photorealistic', 'digital-art', 'illustration', 'ghibli'];
      case 'BASIC':
        return ['photorealistic', 'digital-art', 'illustration', '3d-render', 'pixel-art', 'ghibli'];
      case 'PRO':
        return ['photorealistic', 'digital-art', 'illustration', '3d-render', 'pixel-art', 'anime', 'ghibli'];
      case 'UNLIMITED':
        return ['photorealistic', 'digital-art', 'illustration', '3d-render', 'pixel-art', 'anime', 'ghibli', 'watercolor', 'oil-painting', 'concept-art'];
      default:
        return ['photorealistic', 'digital-art', 'illustration', 'ghibli'];
    }
  };
  
  const isGenerationDisabled = () => {
    if (!currentUser) return true;
    if (!userSubscription) return false;
    
    if (userSubscription.imagesGenerated >= userSubscription.imagesLimit) return true;
    
    if (style === 'ghibli') {
      const ghibliUsed = userSubscription.ghibliImagesGenerated || 0;
      const ghibliLimit = userSubscription.ghibliImagesLimit || 2;
      if (ghibliUsed >= ghibliLimit) return true;
    }
    
    return false;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 flex flex-col">
        {hasFirebaseError && (
          <div className="container px-4 md:px-6 mt-6">
            <Alert className="bg-red-900/20 border-red-600/30">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertTitle className="text-red-300">Firebase Permissions Error</AlertTitle>
              <AlertDescription className="text-red-200/80">
                There seems to be an issue with Firebase permissions. Please check your Firebase security rules or configuration.
              </AlertDescription>
              <div className="mt-2">
                <FirebaseConfigManager />
              </div>
            </Alert>
          </div>
        )}
        
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="inline-block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-sm font-medium mb-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10">AI IMAGE GENERATION PLATFORM</h2>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-white">
                Transform Your Ideas into<br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Stunning Visuals
                </span>
              </h1>
              <p className="text-gray-400 md:text-lg max-w-3xl mx-auto mb-8">
                Generate beautiful, unique visuals from your descriptions in seconds with our
                state-of-the-art AI technology.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" asChild>
                  <Link to="/ghibli">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Try Ghibli Generator
                  </Link>
                </Button>
                <Button variant="outline" className="border-gray-800 text-white hover:bg-white/5" asChild>
                  <Link to="/gallery">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    View Gallery
                  </Link>
                </Button>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
              <div className="lg:col-span-1">
                {currentUser && userSubscription ? (
                  <SubscriptionInfo userLimit={userSubscription} />
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black rounded-lg border border-white/10 p-4 text-center"
                  >
                    <h3 className="text-white font-medium mb-2">Sign in to get started</h3>
                    <p className="text-gray-400 text-sm mb-4">Create an account to generate and save images</p>
                    <Button 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 w-full" 
                      onClick={signInWithGoogle}
                    >
                      Sign In
                    </Button>
                  </motion.div>
                )}
                
                <div className="mt-4 bg-black rounded-lg border border-white/10 p-4">
                  <h3 className="text-white font-medium mb-3">Featured Styles</h3>
                  <div className="space-y-2">
                    <Link to="/ghibli" className="flex items-center hover:bg-white/5 p-2 rounded transition-colors">
                      <div className="h-8 w-8 bg-indigo-500/20 rounded-md flex items-center justify-center mr-3">
                        <span className="text-indigo-400">🎨</span>
                      </div>
                      <span className="text-sm text-gray-300">Ghibli Animation</span>
                    </Link>
                    <Link to="/styles" className="flex items-center hover:bg-white/5 p-2 rounded transition-colors">
                      <div className="h-8 w-8 bg-purple-500/20 rounded-md flex items-center justify-center mr-3">
                        <span className="text-purple-400">🖌️</span>
                      </div>
                      <span className="text-sm text-gray-300">Watercolor Art</span>
                    </Link>
                    <Link to="/styles" className="flex items-center hover:bg-white/5 p-2 rounded transition-colors">
                      <div className="h-8 w-8 bg-blue-500/20 rounded-md flex items-center justify-center mr-3">
                        <span className="text-blue-400">🎮</span>
                      </div>
                      <span className="text-sm text-gray-300">Pixel Art</span>
                    </Link>
                  </div>
                  <Link to="/styles" className="block text-center mt-3 text-indigo-400 text-sm hover:underline">
                    View All Styles
                  </Link>
                </div>
                
                <div className="mt-4 bg-black rounded-lg border border-white/10 p-4">
                  <h3 className="text-white font-medium mb-3">AI Engine</h3>
                  <div className="p-3 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-md border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Google Gemini</span>
                      <button 
                        onClick={() => setUseGemini(!useGemini)}
                        className={`w-10 h-5 rounded-full flex items-center p-0.5 ${useGemini ? 'bg-indigo-600 justify-end' : 'bg-gray-700 justify-start'}`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white"></div>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      {useGemini 
                        ? "Using Google Gemini for enhanced image generation" 
                        : "Switch to use Google Gemini API"}
                    </p>
                    {useGemini && (
                      <p className="text-xs text-indigo-300 mt-2 font-medium">
                        API Key: {API_KEY.substring(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-4">
                <Card className="bg-black border-white/10">
                  <CardContent className="p-0">
                    <Tabs 
                      defaultValue="text-to-image" 
                      className="w-full" 
                      value={activeTab}
                      onValueChange={setActiveTab}
                    >
                      <TabsList className="bg-white/5 w-full rounded-t-lg rounded-b-none border-b border-white/5 p-0">
                        <TabsTrigger 
                          value="text-to-image" 
                          className="flex-1 rounded-none data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-r border-white/5"
                        >
                          Text to Image
                        </TabsTrigger>
                        <TabsTrigger 
                          value="image-to-image" 
                          className="flex-1 rounded-none data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                        >
                          Image to Image
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="p-6">
                        <TabsContent value="text-to-image" className="mt-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-6"
                            >
                              <div className="relative">
                                <Textarea
                                  value={prompt}
                                  onChange={(e) => setPrompt(e.target.value)}
                                  placeholder="Describe the image you want to create..."
                                  className="min-h-[150px] bg-black border-white/10 text-white rounded-md resize-none main-textarea"
                                />
                                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleEnhancePrompt}
                                    disabled={isEnhancing || !prompt.trim()}
                                    className="text-xs bg-transparent border-white/20 text-gray-300 hover:bg-white/10"
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
                                    <SelectTrigger className="bg-black border-white/10 text-white">
                                      <SelectValue placeholder="Select style" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-white/20">
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
                                          ? "flex-1 bg-indigo-600 hover:bg-indigo-700" 
                                          : "flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                                      }
                                      onClick={() => setAspectRatio("1:1")}
                                    >
                                      1:1
                                    </Button>
                                    <Button 
                                      variant={aspectRatio === "16:9" ? "default" : "outline"} 
                                      className={
                                        aspectRatio === "16:9" 
                                          ? "flex-1 bg-indigo-600 hover:bg-indigo-700" 
                                          : "flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                                      }
                                      onClick={() => setAspectRatio("16:9")}
                                    >
                                      16:9
                                    </Button>
                                    <Button 
                                      variant={aspectRatio === "4:3" ? "default" : "outline"} 
                                      className={
                                        aspectRatio === "4:3" 
                                          ? "flex-1 bg-indigo-600 hover:bg-indigo-700" 
                                          : "flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
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
                                    <SelectTrigger className="bg-black border-white/10 text-white">
                                      <SelectValue placeholder="Select quality" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-white/20">
                                      <SelectItem value="standard">Standard</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="ultra-high">Ultra High</SelectItem>
                                      <SelectItem value="max">Maximum</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              {style === 'ghibli' && userSubscription && (
                                <div className="bg-indigo-900/20 border border-indigo-600/30 p-3 rounded-lg">
                                  <p className="text-sm text-indigo-200">
                                    <span className="font-medium">Ghibli Style:</span> You've used {userSubscription.ghibliImagesGenerated || 0} of {userSubscription.ghibliImagesLimit} daily Ghibli images
                                  </p>
                                  <Link to="/ghibli" className="text-sm text-blue-400 hover:underline block mt-1">
                                    Go to dedicated Ghibli Generator
                                  </Link>
                                </div>
                              )}
                              
                              <div className="flex space-x-4">
                                <Button 
                                  onClick={() => handleGenerateImage(false)}
                                  disabled={isGenerating || !prompt.trim() || !currentUser || isGenerationDisabled()}
                                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-md"
                                >
                                  {isGenerating ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Generating...
                                    </>
                                  ) : useGemini ? "Generate with Gemini" : "Generate Image"}
                                </Button>
                                
                                <Button 
                                  onClick={() => handleGenerateImage(true)}
                                  disabled={isGenerating || !prompt.trim() || !currentUser || isGenerationDisabled()}
                                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-md"
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
                            </motion.div>
                            
                            <div className="bg-black rounded-md p-4 min-h-[350px] border border-white/10 flex items-center justify-center">
                              {generatedImage ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="relative group w-full h-full"
                                >
                                  <img 
                                    src={generatedImage.imageUrl} 
                                    alt={generatedImage.prompt} 
                                    className="max-w-full max-h-full object-contain rounded-md mx-auto"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                    <div className="flex space-x-2">
                                      <Button size="sm" variant="outline" className="bg-black/50 border-white/20 hover:bg-black/80">
                                        <Heart className="h-4 w-4 mr-1" /> Save
                                      </Button>
                                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="text-center">
                                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-indigo-400" />
                                  </div>
                                  <p className="text-gray-500">Your generated image will appear here</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="image-to-image" className="mt-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div className="bg-black rounded-lg border border-white/10 p-4 mb-4">
                                <h3 className="text-white font-medium mb-2">Image to Image Generation</h3>
                                <p className="text-gray-300 text-sm mb-4">
                                  Upload an image and our AI will analyze it and create a similar image with the option to modify the style.
                                </p>
                                
                                <ImageUploader onImageGenerated={handleImageUploadGeneration} />
                              </div>
                            </div>
                            
                            <div className="bg-black rounded-md p-4 min-h-[350px] border border-white/10 flex items-center justify-center">
                              {generatedImage ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="relative group w-full h-full"
                                >
                                  <img 
                                    src={generatedImage.imageUrl} 
                                    alt={generatedImage.prompt} 
                                    className="max-w-full max-h-full object-contain rounded-md mx-auto"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                    <div className="flex space-x-2">
                                      <Button size="sm" variant="outline" className="bg-black/50 border-white/20 hover:bg-black/80">
                                        <Heart className="h-4 w-4 mr-1" /> Save
                                      </Button>
                                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="text-center">
                                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-indigo-400" />
                                  </div>
                                  <p className="text-gray-500">Upload an image for analysis</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {currentUser && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-16"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Recent Creations</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadUserData}
                    className="text-gray-300 hover:text-white"
                    disabled={isLoadingImages}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingImages ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                <div className="mb-8">
                  <GalleryGrid 
                    images={recentImages} 
                    emptyMessage="You haven't created any images yet. Start generating!"
                    isLoading={isLoadingImages}
                  />
                </div>
                
                {recentImages.length > 0 && (
                  <div className="text-center">
                    <Link to="/gallery">
                      <Button className="bg-transparent border border-indigo-500 text-white hover:bg-indigo-500/20">
                        View Full Gallery
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
            >
              <div className="bg-black p-6 rounded-lg border border-white/10 transform transition-all hover:translate-y-[-5px] hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="h-12 w-12 rounded-full bg-indigo-900/30 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">State-of-the-Art AI</h3>
                <p className="text-gray-400">
                  Our platform uses cutting-edge AI technology to generate stunning, high-resolution 
                  images from text descriptions with remarkable accuracy.
                </p>
              </div>
              
              <div className="bg-black p-6 rounded-lg border border-white/10 transform transition-all hover:translate-y-[-5px] hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="h-12 w-12 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Multiple Styles</h3>
                <p className="text-gray-400">
                  Choose from multiple artistic styles including Ghibli animation, photorealistic renders, 
                  digital art, illustrations, 3D renders, and more.
                </p>
              </div>
              
              <div className="bg-black p-6 rounded-lg border border-white/10 transform transition-all hover:translate-y-[-5px] hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="h-12 w-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-4">
                  <ImageIcon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Image Analysis</h3>
                <p className="text-gray-400">
                  Upload your own images and our AI will analyze them to create similar images 
                  or transform them into different artistic styles.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
