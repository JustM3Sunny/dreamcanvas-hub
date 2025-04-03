
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  ImageIcon, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Image
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { checkUserLimit, generateGhibliImage } from '../services/imageService';

const GhibliTransformer: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyzedPrompt, setAnalyzedPrompt] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [userGhibliLimit, setUserGhibliLimit] = useState({ used: 0, total: 5 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentUser) {
      loadUserLimits();
    }
  }, [currentUser]);

  const loadUserLimits = async () => {
    if (!currentUser) return;
    
    try {
      const userLimit = await checkUserLimit(currentUser.uid);
      setUserGhibliLimit({
        used: userLimit?.ghibliImagesGenerated || 0,
        total: userLimit?.ghibliImagesLimit || 5
      });
    } catch (error) {
      console.error("Error loading user limits:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setAnalyzedPrompt('');
    setGeneratedImageUrl(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setUploadError('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size cannot exceed 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalyzedPrompt('');
    setGeneratedImageUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !currentUser) {
      toast.error('Please select an image and sign in to continue');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzedPrompt('');
    
    try {
      // Get Google Gemini API key
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 
                      localStorage.getItem("GEMINI_API_KEY") || 
                      "AIzaSyDc7u7wTVdDG3zP18xnELKs0HX7-hImkmc";
      
      if (!API_KEY) {
        throw new Error("Gemini API key not found");
      }

      // Convert image to base64
      const fileReader = new FileReader();
      const imageBase64Promise = new Promise<string>((resolve, reject) => {
        fileReader.onload = () => {
          const result = fileReader.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error("Failed to convert image to Base64"));
          }
        };
        fileReader.onerror = () => reject(fileReader.error);
        fileReader.readAsDataURL(selectedImage);
      });
      
      const imageBase64 = await imageBase64Promise;

      // Initialize Google Generative AI with the working model
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using the working model
      
      // Analyze the image
      toast.info("Analyzing your image...");
      const result = await model.generateContent([
        imageBase64,
        "Analyze this image in detail and create a comprehensive descriptive prompt that would generate a similar image. Include all visual elements, subjects, colors, composition, lighting, mood, and background details. Be specific and detailed but concise."
      ]);
      
      const analyzedText = result.response.text();
      setAnalyzedPrompt(analyzedText);
      toast.success("Image analyzed successfully!");
      
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      toast.error(error.message || "Failed to analyze image");
      setAnalyzedPrompt("Failed to analyze image automatically. Please try again or write your own description.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateGhibliStyleImage = async () => {
    if (!analyzedPrompt || !currentUser) {
      toast.error('Please analyze an image or provide a description first');
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info("Generating Ghibli style image...");
      
      // Use our specialized Ghibli image generator
      const result = await generateGhibliImage(analyzedPrompt, currentUser.uid);
      setGeneratedImageUrl(result.imageUrl);
      await loadUserLimits(); // Refresh limits
      
      toast.success("Ghibli style image generated successfully!");
    } catch (error: any) {
      console.error("Error generating Ghibli style image:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const usagePercentage = (userGhibliLimit.used / userGhibliLimit.total) * 100;
  const remainingImages = userGhibliLimit.total - userGhibliLimit.used;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Your Ghibli Limit</CardTitle>
              <CardDescription>Transform your images into Ghibli style</CardDescription>
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
              <CardTitle>How it Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">1</div>
                <p>Upload any image you'd like to transform</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">2</div>
                <p>AI analyzes the image and creates a detailed description</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">3</div>
                <p>Generate a Studio Ghibli style version of your image</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Upload Panel */}
            <Card className="bg-slate-800 border-slate-700 md:col-span-1 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Upload Image</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                
                {!previewUrl ? (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={triggerFileInput}
                    className="cursor-pointer"
                  >
                    <div className="border-dashed border-2 border-slate-500 bg-transparent hover:bg-slate-800/50 transition-colors rounded-md p-8 flex flex-col items-center justify-center">
                      {uploadError ? (
                        <>
                          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                          <p className="text-red-500 text-center mb-2">
                            {uploadError}
                          </p>
                          <p className="text-gray-500 text-sm text-center">
                            Click to try again
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-300 text-center mb-2">
                            Click to upload an image
                          </p>
                          <p className="text-gray-500 text-xs text-center">
                            JPG, PNG, or GIF (max 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-md overflow-hidden aspect-square">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2 bg-black/60 text-white hover:bg-black/80 h-8 w-8 p-1.5"
                        onClick={clearSelectedImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={analyzeImage}
                      disabled={isAnalyzing || !selectedImage}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* AI Analysis Panel */}
            <Card className="bg-slate-800 border-slate-700 md:col-span-1 h-full">
              <CardHeader>
                <CardTitle className="text-lg">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {analyzedPrompt ? (
                  <div className="space-y-4">
                    <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600 text-sm text-white h-[250px] overflow-y-auto">
                      {analyzedPrompt}
                    </div>
                    
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={generateGhibliStyleImage}
                      disabled={isGenerating || !analyzedPrompt || userGhibliLimit.used >= userGhibliLimit.total}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Generate Ghibli
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="h-[290px] flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                    <p className="text-center text-sm">
                      {selectedImage 
                        ? "Click 'Analyze Image' to start" 
                        : "Upload an image to begin analysis"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Result Panel */}
            <Card className="bg-slate-800 border-slate-700 md:col-span-1 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Ghibli Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[290px] flex items-center justify-center">
                  {generatedImageUrl ? (
                    <motion.img 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={generatedImageUrl}
                      alt="Ghibli Style Image" 
                      className="max-w-full max-h-[290px] rounded-md object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                        {analyzedPrompt 
                          ? "Click 'Generate Ghibli' to create image" 
                          : "Waiting for image analysis"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Gallery of Examples */}
          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle>Ghibli Style Examples</CardTitle>
              <CardDescription>See the magic of Ghibli transformations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="relative aspect-video bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-md overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400/50" />
                    </div>
                    <p className="text-xs text-gray-400 relative z-10">Ghibli-style landscape</p>
                  </div>
                  <p className="text-xs text-gray-400">Landscapes transform into magical Ghibli worlds</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="relative aspect-video bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-md overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400/50" />
                    </div>
                    <p className="text-xs text-gray-400 relative z-10">Ghibli-style character</p>
                  </div>
                  <p className="text-xs text-gray-400">People transform into Ghibli-style characters</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="relative aspect-video bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-md overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400/50" />
                    </div>
                    <p className="text-xs text-gray-400 relative z-10">Ghibli creatures</p>
                  </div>
                  <p className="text-xs text-gray-400">Animals transform with Ghibli's whimsical style</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GhibliTransformer;
