
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download,
  Copy,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
  Calendar,
  Filter,
  UserCircle,
  Sparkles
} from 'lucide-react';
import {
  getUserImages,
  getGalleryImages,
  GeneratedImage,
} from '../services/imageService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatDistanceToNow } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface GalleryState {
  myImages: GeneratedImage[];
  publicImages: GeneratedImage[];
  loading: boolean;
  currentPage: number;
  hasMore: boolean;
  selectedImage: GeneratedImage | null;
  filter: string;
}

const Gallery = () => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<GalleryState>({
    myImages: [],
    publicImages: [],
    loading: true,
    currentPage: 1,
    hasMore: true,
    selectedImage: null,
    filter: 'all',
  });
  
  useEffect(() => {
    if (currentUser) {
      loadImages();
    } else {
      loadPublicImages();
    }
  }, [currentUser]);
  
  const loadImages = async () => {
    if (!currentUser) return;
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const myImages = await getUserImages(currentUser.uid);
      const publicImages = await getGalleryImages();
      
      setState(prev => ({
        ...prev,
        myImages,
        publicImages,
        loading: false,
        hasMore: publicImages.length === 12
      }));
    } catch (error: any) {
      console.error('Error loading gallery images:', error);
      toast.error(error.message || 'Failed to load gallery images');
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  const loadPublicImages = async (page: number = 1) => {
    setState(prev => ({ ...prev, loading: true, currentPage: page }));
    
    try {
      const lastImage = page > 1 && state.publicImages.length > 0
        ? state.publicImages[state.publicImages.length - 1]
        : null;
      
      const publicImages = await getGalleryImages(12, lastImage);
      
      setState(prev => ({
        ...prev,
        publicImages: page === 1 ? publicImages : [...prev.publicImages, ...publicImages],
        loading: false,
        hasMore: publicImages.length === 12
      }));
    } catch (error: any) {
      console.error('Error loading gallery images:', error);
      toast.error(error.message || 'Failed to load gallery images');
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  const loadMoreImages = () => {
    loadPublicImages(state.currentPage + 1);
  };
  
  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagicaaa-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };
  
  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };
  
  const filteredImages = (images: GeneratedImage[]) => {
    if (state.filter === 'all') return images;
    return images.filter(img => img.style === state.filter);
  };
  
  const uniqueStyles = Array.from(new Set([
    ...state.myImages.map(img => img.style),
    ...state.publicImages.map(img => img.style)
  ]));
  
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Image Gallery</h1>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  {state.filter === 'all' ? 'All Styles' : state.filter.charAt(0).toUpperCase() + state.filter.slice(1).replace('-', ' ')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-imaginexus-darker border-gray-800 text-white">
                <DropdownMenuItem 
                  className="hover:bg-gray-800 focus:bg-gray-800" 
                  onClick={() => setState(prev => ({ ...prev, filter: 'all' }))}
                >
                  All Styles
                </DropdownMenuItem>
                {uniqueStyles.map(style => (
                  <DropdownMenuItem 
                    key={style} 
                    className="hover:bg-gray-800 focus:bg-gray-800"
                    onClick={() => setState(prev => ({ ...prev, filter: style }))}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/">
              <Button className="bg-imaginexus-accent1 hover:bg-imaginexus-accent1/80">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate More
              </Button>
            </Link>
          </div>
        </div>
        
        {!currentUser ? (
          <Alert className="mb-6 bg-blue-900/20 border-blue-500/30">
            <UserCircle className="h-5 w-5 text-blue-400" />
            <AlertTitle className="text-blue-300">Sign in to see your personal gallery</AlertTitle>
            <AlertDescription className="text-blue-200/80">
              Create an account to generate and save your own images
            </AlertDescription>
          </Alert>
        ) : null}
        
        <Tabs defaultValue={currentUser ? "my-gallery" : "public"} className="w-full">
          <TabsList className="bg-imaginexus-darker border-gray-800 mb-8">
            {currentUser && (
              <TabsTrigger value="my-gallery" className="data-[state=active]:bg-imaginexus-accent1 text-white">
                My Gallery
              </TabsTrigger>
            )}
            <TabsTrigger value="public" className="data-[state=active]:bg-imaginexus-accent1 text-white">
              Community Gallery
            </TabsTrigger>
          </TabsList>
          
          {currentUser && (
            <TabsContent value="my-gallery">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {state.loading ? (
                  Array(4).fill(null).map((_, i) => (
                    <Card key={i} className="border-gray-800 bg-imaginexus-darker animate-pulse">
                      <div className="aspect-square bg-gray-800/50"></div>
                    </Card>
                  ))
                ) : filteredImages(state.myImages).length > 0 ? (
                  filteredImages(state.myImages).map((image) => (
                    <ImageCard 
                      key={image.id} 
                      image={image}
                      onDownload={handleDownload}
                      onCopyPrompt={copyPrompt}
                      onImageClick={() => setState(prev => ({ ...prev, selectedImage: image }))}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-700 mb-4" />
                    <h3 className="text-xl text-gray-400 mb-2">No images found</h3>
                    <p className="text-gray-500 mb-6">
                      {state.filter !== 'all' 
                        ? `No images with the style "${state.filter}" found. Try a different filter or generate new images.`
                        : "You haven't generated any images yet. Start creating to build your gallery."}
                    </p>
                    <Link to="/">
                      <Button className="gradient-btn">
                        Generate Your First Image
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="public">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {state.loading && state.currentPage === 1 ? (
                Array(8).fill(null).map((_, i) => (
                  <Card key={i} className="border-gray-800 bg-imaginexus-darker animate-pulse">
                    <div className="aspect-square bg-gray-800/50"></div>
                  </Card>
                ))
              ) : filteredImages(state.publicImages).length > 0 ? (
                filteredImages(state.publicImages).map((image) => (
                  <ImageCard 
                    key={image.id} 
                    image={image}
                    onDownload={handleDownload}
                    onCopyPrompt={copyPrompt}
                    onImageClick={() => setState(prev => ({ ...prev, selectedImage: image }))}
                    isPublic={true}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-700 mb-4" />
                  <h3 className="text-xl text-gray-400 mb-2">No images found</h3>
                  <p className="text-gray-500 mb-6">
                    {state.filter !== 'all' 
                      ? `No community images with the style "${state.filter}" found. Try a different filter.`
                      : "No community images available yet. Be the first to contribute!"}
                  </p>
                  <Link to="/">
                    <Button className="gradient-btn">
                      Generate Images
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {state.hasMore && filteredImages(state.publicImages).length > 0 && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                  onClick={loadMoreImages}
                  disabled={state.loading}
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {state.selectedImage && (
          <ImageDetailDialog 
            image={state.selectedImage} 
            onClose={() => setState(prev => ({ ...prev, selectedImage: null }))}
            onDownload={handleDownload}
            onCopyPrompt={copyPrompt}
          />
        )}
      </main>
      
      <footer className="border-t border-gray-800 py-6">
        <div className="container px-4 md:px-6 text-center text-gray-500">
          <p>© 2023 Imagicaaa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface ImageCardProps {
  image: GeneratedImage;
  onDownload: (image: GeneratedImage) => void;
  onCopyPrompt: (prompt: string) => void;
  onImageClick: () => void;
  isPublic?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  onDownload, 
  onCopyPrompt, 
  onImageClick,
  isPublic = false
}) => {
  return (
    <Card className="overflow-hidden border-gray-800 bg-imaginexus-darker hover:border-imaginexus-accent1/50 transition-all group">
      <div 
        className="aspect-square relative cursor-pointer" 
        onClick={onImageClick}
      >
        <img 
          src={image.imageUrl} 
          alt={image.prompt} 
          className="object-cover w-full h-full"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
          <div className="text-white line-clamp-3 text-sm">
            {image.prompt}
          </div>
        </div>
      </div>
      <CardContent className="p-3 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  <span className="truncate max-w-[80px]">{image.style}</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-imaginexus-darker border-gray-800 text-white">
                <div className="space-y-2">
                  <p className="text-sm">{image.prompt}</p>
                  <div className="flex items-center pt-2">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(image.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onCopyPrompt(image.prompt)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="sr-only">Copy prompt</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDownload(image)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ImageDetailDialogProps {
  image: GeneratedImage;
  onClose: () => void;
  onDownload: (image: GeneratedImage) => void;
  onCopyPrompt: (prompt: string) => void;
}

const ImageDetailDialog: React.FC<ImageDetailDialogProps> = ({ 
  image, 
  onClose,
  onDownload,
  onCopyPrompt
}) => {
  return (
    <Dialog open={true} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-imaginexus-darker border-gray-800 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-white">Image Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-center bg-black rounded-md overflow-hidden">
            <img 
              src={image.imageUrl} 
              alt={image.prompt} 
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-400 text-sm mb-1">Prompt</h3>
              <p className="text-white bg-gray-800/50 p-3 rounded-md text-sm">{image.prompt}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Style</h3>
                <p className="text-white bg-gray-800/50 p-2 rounded-md text-sm">{image.style}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Aspect Ratio</h3>
                <p className="text-white bg-gray-800/50 p-2 rounded-md text-sm">{image.aspectRatio}</p>
              </div>
              {image.model && (
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Model</h3>
                  <p className="text-white bg-gray-800/50 p-2 rounded-md text-sm">{image.model}</p>
                </div>
              )}
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Created</h3>
                <p className="text-white bg-gray-800/50 p-2 rounded-md text-sm">
                  {formatDistanceToNow(new Date(image.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="pt-4 flex space-x-3">
              <Button 
                className="flex-1 bg-imaginexus-accent1 hover:bg-imaginexus-accent1/80 text-white" 
                onClick={() => onCopyPrompt(image.prompt)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Prompt
              </Button>
              <Button 
                className="flex-1 border-gray-700 bg-transparent hover:bg-gray-800 text-white" 
                variant="outline"
                onClick={() => onDownload(image)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            
            <Link to="/" className="block pt-4">
              <Button className="w-full gradient-btn">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Similar Image
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Gallery;
