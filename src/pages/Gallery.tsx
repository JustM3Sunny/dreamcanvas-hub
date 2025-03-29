
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserImages, GeneratedImage } from '../services/imageService';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Download, Share, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const { currentUser } = useAuth();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStyle, setFilterStyle] = useState('all');
  
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
  
  const filteredImages = images.filter(image => {
    return (
      image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (filterStyle === 'all' || image.style === filterStyle)
    );
  });
  
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Your Gallery</h1>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search by prompt..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-imaginexus-darker border border-gray-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-imaginexus-accent1"
              />
            </div>
            
            <div className="relative">
              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="pl-10 pr-4 py-2 bg-imaginexus-darker border border-gray-800 rounded-md text-white appearance-none focus:outline-none focus:ring-2 focus:ring-imaginexus-accent1"
              >
                <option value="all">All Styles</option>
                <option value="photorealistic">Photorealistic</option>
                <option value="digital-art">Digital Art</option>
                <option value="illustration">Illustration</option>
                <option value="3d-render">3D Render</option>
                <option value="pixel-art">Pixel Art</option>
                <option value="anime">Anime</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            </div>
            
            <Button variant="outline" className="border-gray-700">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-imaginexus-accent1"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16 bg-imaginexus-darker rounded-lg border border-gray-800 p-8">
            {searchTerm || filterStyle !== 'all' ? (
              <>
                <h3 className="text-xl text-white mb-4">No matching images found</h3>
                <p className="text-gray-400 mb-8">Try adjusting your search or filters</p>
                <Button 
                  variant="outline" 
                  className="border-gray-700 text-white"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStyle('all');
                  }}
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl text-white mb-4">Your gallery is empty</h3>
                <p className="text-gray-400 mb-8">Generate your first image to get started!</p>
                <Link to="/">
                  <Button className="gradient-btn text-white px-6 py-2">
                    Create Image
                  </Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 bg-imaginexus-darker rounded-lg p-4 border border-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">Gallery Stats</h2>
                  <p className="text-gray-400">Total images: {images.length} | Unique styles: {new Set(images.map(img => img.style)).size}</p>
                </div>
                <Link to="/">
                  <Button className="gradient-btn text-white">
                    Create New Image
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="image-grid">
              {filteredImages.map((image, index) => {
                // Randomly assign some images as tall or wide for visual interest
                const isWide = index % 5 === 0;
                const isTall = index % 7 === 0;
                
                return (
                  <div 
                    key={image.id || index}
                    className={`image-grid-item ${isWide ? 'wide' : ''} ${isTall ? 'tall' : ''}`}
                  >
                    <img src={image.imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <p className="text-white text-sm mb-2 line-clamp-2">{image.prompt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-300 bg-black/40 px-2 py-1 rounded">
                          {image.style}
                        </span>
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
                  </div>
                );
              })}
            </div>
            
            {/* Fix: Removed jsx and global properties from style tag */}
            <style>
              {`
              .image-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                grid-auto-rows: 250px;
                grid-auto-flow: dense;
                gap: 16px;
              }
              
              .image-grid-item {
                position: relative;
                overflow: hidden;
                border-radius: 8px;
                transition: all 0.3s ease;
              }
              
              .image-grid-item:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
              }
              
              .image-grid-item.wide {
                grid-column: span 2;
              }
              
              .image-grid-item.tall {
                grid-row: span 2;
              }
              
              @media (max-width: 768px) {
                .image-grid-item.wide, .image-grid-item.tall {
                  grid-column: span 1;
                  grid-row: span 1;
                }
              }
              `}
            </style>
          </>
        )}
      </main>
    </div>
  );
};

export default Gallery;
