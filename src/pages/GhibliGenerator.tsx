
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ImageIcon, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import ImageUploader from '../components/ImageUploader';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { getUserSubscription, generateGhibliImage, GeneratedImage } from '../services/imageService';

const GhibliGenerator = () => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [userGhibliLimit, setUserGhibliLimit] = useState({ used: 0, total: 5 });
  const [activeTab, setActiveTab] = useState('text-to-image');

  useEffect(() => {
    if (currentUser) {
      loadUserLimits();
    }
  }, [currentUser]);

  const loadUserLimits = async () => {
    if (!currentUser) return;
    
    try {
      const subscription = await getUserSubscription(currentUser.uid);
      setUserGhibliLimit({
        used: subscription.ghibliImagesGenerated || 0,
        total: subscription.ghibliImagesLimit || 5
      });
    } catch (error) {
      console.error("Error loading user limits:", error);
    }
  };

  const handleGenerateGhibliImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }
    
    if (!currentUser) {
      toast.error('Please sign in to generate images');
      return;
    }

    if (userGhibliLimit.used >= userGhibliLimit.total) {
      toast.error(`You've reached your limit of ${userGhibliLimit.total} Ghibli images. Please upgrade your plan for more.`);
      return;
    }
    
    setIsGenerating(true);
    try {
      const image = await generateGhibliImage(prompt, currentUser.uid);
      setGeneratedImage(image);
      await loadUserLimits(); // Refresh limits after generation
      toast.success('Ghibli style image generated successfully!');
    } catch (error: any) {
      console.error('Error generating Ghibli image:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUploadGeneration = async (imageUrl: string, analyzedPrompt: string) => {
    setGeneratedImage({
      imageUrl,
      prompt: analyzedPrompt,
      style: 'ghibli',
      aspectRatio: '1:1',
      createdAt: Date.now(),
      userId: currentUser?.uid || ''
    });
    
    setActiveTab('text-to-image');
    setPrompt(analyzedPrompt);
    
    await loadUserLimits();
  };

  const usagePercentage = (userGhibliLimit.used / userGhibliLimit.total) * 100;
  const remainingImages = userGhibliLimit.total - userGhibliLimit.used;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      <Navbar />
      
      <main className="flex-1 container px-4 py-8 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ghibli Style Generator
            </span>
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Create beautiful artwork in the iconic Studio Ghibli style with our specialized AI model.
            Generate dreamlike landscapes, whimsical characters, and enchanting scenes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Your Ghibli Limit</CardTitle>
                <CardDescription>Each user gets 5 Ghibli style generations daily</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span>Daily generation limit</span>
                    <span className="font-medium">
                      {userGhibliLimit.used} / {userGhibliLimit.total}
                    </span>
                  </div>
                  <Progress 
                    value={usagePercentage} 
                    className="h-2 bg-slate-700" 
                    indicatorClassName={usagePercentage > 80 ? "bg-red-500" : "bg-indigo-500"}
                  />
                </div>
                
                {userGhibliLimit.used >= userGhibliLimit.total ? (
                  <Alert className="bg-red-900/20 border-red-600/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200/80">
                      You've reached your daily limit. Limit resets in 24 hours.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-gray-300">
                    You have <span className="text-white font-medium">{remainingImages}</span> Ghibli generations remaining today.
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Tips for Ghibli Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Include natural elements like forests, water, or skies</p>
                <p>• Mention "soft colors" and "detailed backgrounds"</p>
                <p>• Include whimsical or magical elements</p>
                <p>• Describe serene or fantastical environments</p>
                <p>• Mention "Miyazaki-inspired" or "hand-drawn animation style"</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-5">
            <Tabs 
              defaultValue="text-to-image" 
              className="w-full" 
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="bg-slate-800 border-slate-700 mb-6">
                <TabsTrigger value="text-to-image" className="data-[state=active]:bg-indigo-600 text-white">
                  Text to Ghibli
                </TabsTrigger>
                <TabsTrigger value="image-to-image" className="data-[state=active]:bg-indigo-600 text-white">
                  Image to Ghibli
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text-to-image">
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
                        placeholder="Describe the Ghibli style scene you want to create... (e.g. 'A young girl standing in a meadow with magical creatures floating around her under a sunny sky with fluffy clouds')"
                        className="min-h-[150px] bg-slate-800 text-white border-slate-700 rounded-md resize-none"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleGenerateGhibliImage}
                      disabled={isGenerating || !prompt.trim() || !currentUser || userGhibliLimit.used >= userGhibliLimit.total}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-md"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Ghibli Art...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Ghibli Artwork
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  <div className="flex items-center justify-center bg-slate-800/50 rounded-md p-4 min-h-[350px] border border-slate-700">
                    {generatedImage ? (
                      <motion.img 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={generatedImage.imageUrl} 
                        alt={generatedImage.prompt} 
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-400">Your Ghibli artwork will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="image-to-image">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>Transform Your Image into Ghibli Style</CardTitle>
                    <CardDescription>
                      Upload an image to transform it into the enchanting Ghibli animation style
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUploader onImageGenerated={handleImageUploadGeneration} forceStyle="ghibli" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Ghibli Style?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700 transform transition hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Magical Aesthetics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Studio Ghibli's iconic visual style is known for its dreamlike quality, attention to detail, 
                  and ability to bring fantasy worlds to life with vibrant colors and fluid animation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700 transform transition hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Emotional Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  The Ghibli style evokes powerful emotions through its distinctive combination of 
                  wonder, nostalgia and environmental themes, creating images that resonate deeply.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700 transform transition hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Timeless Appeal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  The hand-drawn aesthetic and attention to natural details gives Ghibli art a timeless 
                  quality that transcends trends and continues to inspire new generations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GhibliGenerator;
