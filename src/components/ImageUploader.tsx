
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateFromImage } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

interface ImageUploaderProps {
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  forceStyle?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageGenerated, forceStyle }) => {
  const { currentUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedPrompt, setAnalyzedPrompt] = useState<string>('');
  const [style, setStyle] = useState<string>(forceStyle || "match-original");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
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
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleAnalyzeImage = async () => {
    if (!selectedImage || !currentUser) {
      toast.error('Please select an image and sign in to continue');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await generateFromImage(selectedImage, currentUser.uid, {
        style: forceStyle || style,
        enhancePrompt: true
      });
      setAnalyzedPrompt(result.analyzedPrompt);
      onImageGenerated(result.image.imageUrl, result.analyzedPrompt);
      toast.success('Image analyzed and similar image generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze image');
      console.error("Error analyzing image:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="w-full">
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
        >
          <Card 
            className={`border-dashed border-2 ${uploadError ? 'border-red-500' : 'border-slate-500'} bg-transparent hover:bg-slate-800/50 transition-colors cursor-pointer`} 
            onClick={triggerFileInput}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
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
                    Click to upload an image for analysis
                  </p>
                  <p className="text-gray-500 text-sm text-center">
                    JPG, PNG, or GIF (max 5MB)
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="border bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-white font-medium">Image Preview</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white p-1 h-auto"
                onClick={clearSelectedImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative rounded-md overflow-hidden aspect-square mb-4">
              <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {!forceStyle && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Output Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="match-original">Match Original</SelectItem>
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="digital-art">Digital Art</SelectItem>
                    <SelectItem value="illustration">Illustration</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="3d-render">3D Render</SelectItem>
                    <SelectItem value="pixel-art">Pixel Art</SelectItem>
                    <SelectItem value="ghibli">Studio Ghibli</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {analyzedPrompt && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-slate-700/50 p-3 rounded-md border border-slate-600"
              >
                <h4 className="text-gray-300 text-sm mb-1">AI Analysis:</h4>
                <p className="text-white text-sm">{analyzedPrompt}</p>
              </motion.div>
            )}
            
            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              onClick={handleAnalyzeImage}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : analyzedPrompt ? 'Generate Again' : `Analyze & Generate ${forceStyle ? forceStyle + ' ' : ''}Image`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUploader;
