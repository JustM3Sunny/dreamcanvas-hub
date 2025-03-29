
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserImages, GeneratedImage } from '../services/imageService';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Download, Share } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const { currentUser } = useAuth();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadImages() {
      if (currentUser) {
        setLoading(true);
        try {
          const userImages = await getUserImages(currentUser.uid);
          setImages(userImages);
        } catch (error) {
          console.error('Error loading images:', error);
          toast.error('Failed to load images');
        } finally {
          setLoading(false);
        }
      } else {
        setImages([]);
        setLoading(false);
      }
    }
    
    loadImages();
  }, [currentUser]);
  
  const handleDownload = (image: GeneratedImage) => {
    // In a real app, this would download the image
    toast.success('Download started!');
  };
  
  const handleShare = (image: GeneratedImage) => {
    // In a real app, this would open a share dialog
    toast.success('Share dialog would open here');
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-imaginexus-dark">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Sign In to View Your Gallery</h2>
          <p className="text-gray-300 mb-6">You need to sign in to view and manage your generated images.</p>
          <Link to="/">
            <Button className="gradient-btn text-white px-8 py-6">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">Your Gallery</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-imaginexus-accent1"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl text-white mb-4">No images yet</h3>
            <p className="text-gray-400 mb-8">Generate your first image to get started!</p>
            <Link to="/">
              <Button className="gradient-btn text-white px-6 py-2">
                Create Image
              </Button>
            </Link>
          </div>
        ) : (
          <div className="image-grid">
            {images.map((image, index) => {
              // Randomly assign some images as tall or wide for visual interest
              const isWide = index % 5 === 0;
              const isTall = index % 7 === 0;
              
              return (
                <div 
                  key={image.id || index}
                  className={`image-grid-item ${isWide ? 'wide' : ''} ${isTall ? 'tall' : ''}`}
                >
                  <img src={image.imageUrl} alt={image.prompt} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-white text-sm mb-2 line-clamp-2">{image.prompt}</p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(image)}
                        className="bg-transparent border-white text-white hover:bg-white/20"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleShare(image)}
                        className="bg-transparent border-white text-white hover:bg-white/20"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;
