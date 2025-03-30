
import React from 'react';
import { GeneratedImage } from '../services/imageService';
import { motion } from 'framer-motion';
import { Download, Share2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface GalleryGridProps {
  images: GeneratedImage[];
  emptyMessage?: string;
  isLoading?: boolean;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ 
  images, 
  emptyMessage = "No images to display", 
  isLoading = false 
}) => {
  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `image-${image.id || Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
      console.error("Download error:", error);
    }
  };

  const handleShare = (image: GeneratedImage) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this AI-generated image!',
        text: image.prompt,
        url: image.imageUrl,
      })
        .then(() => toast.success("Shared successfully!"))
        .catch((error) => {
          console.error("Error sharing:", error);
          toast.error("Failed to share");
        });
    } else {
      navigator.clipboard.writeText(image.imageUrl)
        .then(() => toast.success("Image URL copied to clipboard!"))
        .catch(() => toast.error("Failed to copy URL"));
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index}
            className="bg-imaginexus-darker rounded-md overflow-hidden aspect-square animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg 
          className="w-16 h-16 text-gray-700 mb-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-400 mb-4">{emptyMessage}</p>
        <Link to="/">
          <Button className="gradient-btn">Generate Images</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <motion.div 
          key={image.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative group rounded-lg overflow-hidden aspect-square bg-imaginexus-darker"
        >
          <Dialog>
            <DialogTrigger asChild>
              <img 
                src={image.imageUrl} 
                alt={image.prompt} 
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
              />
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-black border-gray-800">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black rounded-md overflow-hidden">
                  <img 
                    src={image.imageUrl} 
                    alt={image.prompt} 
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div className="p-2">
                  <h3 className="text-xl font-medium text-white mb-2">Image Details</h3>
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Prompt</p>
                      <p className="text-white">{image.prompt}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-400 text-sm">Style</p>
                        <p className="text-white capitalize">{image.style.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Aspect Ratio</p>
                        <p className="text-white">{image.aspectRatio}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Generated On</p>
                      <p className="text-white">{new Date(image.createdAt).toLocaleString()}</p>
                    </div>
                    {image.model && (
                      <div>
                        <p className="text-gray-400 text-sm">Model</p>
                        <p className="text-white">{image.model}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-transparent border-gray-700 text-white hover:bg-gray-800"
                      onClick={() => handleDownload(image)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-transparent border-gray-700 text-white hover:bg-gray-800"
                      onClick={() => handleShare(image)}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <p className="text-white text-sm line-clamp-2 mb-2">{image.prompt}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded-full capitalize">
                {image.style.replace('-', ' ')}
              </span>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/75"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(image);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/75"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GalleryGrid;
