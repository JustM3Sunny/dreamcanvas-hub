
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { getUserSubscription } from '../services/imageService';
import { Link } from 'react-router-dom';
import { Crown, Star, Lock } from 'lucide-react';

const STYLE_EXAMPLES = [
  {
    name: 'Photorealistic',
    description: 'Highly detailed images that look like real photographs',
    tier: 'FREE',
    imageUrl: 'https://images.unsplash.com/photo-1682685797661-9e0c87f59c60',
    examples: ['Landscape photography', 'Portrait photography', 'Product photography']
  },
  {
    name: 'Digital Art',
    description: 'Modern digital artwork with vibrant colors and details',
    tier: 'FREE',
    imageUrl: 'https://images.unsplash.com/photo-1684276002885-a2311211260f',
    examples: ['Fantasy scene', 'Sci-fi concept art', 'Abstract digital art']
  },
  {
    name: 'Illustration',
    description: 'Hand-drawn style illustrations and drawings',
    tier: 'FREE',
    imageUrl: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be',
    examples: ['Cartoon characters', 'Book illustrations', 'Line drawings']
  },
  {
    name: '3D Render',
    description: 'Three-dimensional rendered objects and scenes',
    tier: 'BASIC',
    imageUrl: 'https://images.unsplash.com/photo-1679112567407-85b8c90f2cdf',
    examples: ['3D product visualization', 'Architectural renders', '3D character models']
  },
  {
    name: 'Pixel Art',
    description: 'Retro-style art with visible pixels',
    tier: 'BASIC',
    imageUrl: 'https://images.unsplash.com/photo-1633360621093-a3a17a5a0083',
    examples: ['Game sprites', '8-bit style scenes', 'Retro game art']
  },
  {
    name: 'Anime',
    description: 'Japanese animation style artwork',
    tier: 'PRO',
    imageUrl: 'https://images.unsplash.com/photo-1619410283995-43d9134e0f0d',
    examples: ['Anime characters', 'Anime backgrounds', 'Manga style']
  },
  {
    name: 'Ghibli',
    description: "Artwork inspired by Studio Ghibli's distinctive animation style",
    tier: 'PRO',
    imageUrl: 'https://images.unsplash.com/photo-1638272181967-78d9f9b3b3e6',
    examples: ['Ghibli landscapes', 'Ghibli characters', 'Whimsical scenes']
  },
  {
    name: 'Watercolor',
    description: 'Digital art that mimics watercolor painting techniques',
    tier: 'UNLIMITED',
    imageUrl: 'https://images.unsplash.com/photo-1608197456986-c2d7894a7076',
    examples: ['Watercolor landscapes', 'Watercolor portraits', 'Abstract watercolors']
  },
  {
    name: 'Oil Painting',
    description: 'Digital art that mimics traditional oil painting',
    tier: 'UNLIMITED',
    imageUrl: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62b1',
    examples: ['Classical style paintings', 'Modern oil paintings', 'Oil painting portraits']
  }
];

const tierBadges = {
  FREE: { color: 'bg-gray-600', icon: null },
  BASIC: { color: 'bg-blue-600', icon: <Star className="w-3 h-3 mr-1" /> },
  PRO: { color: 'bg-purple-600', icon: <Crown className="w-3 h-3 mr-1" /> },
  UNLIMITED: { color: 'bg-amber-600', icon: <Crown className="w-3 h-3 mr-1" /> }
};

const Styles = () => {
  const { currentUser } = useAuth();
  const [userTier, setUserTier] = useState('FREE');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadUserTier() {
      if (currentUser) {
        try {
          const subscription = await getUserSubscription(currentUser.uid);
          setUserTier(subscription.tier);
        } catch (error) {
          console.error("Error loading user tier:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    
    loadUserTier();
  }, [currentUser]);
  
  const isStyleAvailable = (styleTier: string) => {
    const tiers = ['FREE', 'BASIC', 'PRO', 'UNLIMITED'];
    const userTierIndex = tiers.indexOf(userTier);
    const styleTierIndex = tiers.indexOf(styleTier);
    
    return userTierIndex >= styleTierIndex;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl font-bold mb-4 text-white">Image Generation Styles</h1>
          <p className="text-xl text-gray-300">
            Explore the diverse range of artistic styles available for generating images with Imagicaaa
          </p>
          
          {currentUser ? (
            <div className="mt-6 p-4 bg-imaginexus-darker rounded-lg border border-gray-800">
              <p className="text-white">
                You're currently on the <span className="font-bold">{userTier}</span> plan
              </p>
              {userTier !== 'UNLIMITED' && (
                <Link to="/pricing">
                  <Button className="gradient-btn mt-2">
                    Upgrade for More Styles
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-gray-300 mb-2">Sign in to access all styles</p>
              <Link to="/">
                <Button className="gradient-btn">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STYLE_EXAMPLES.map((style) => {
            const available = isStyleAvailable(style.tier);
            const tierInfo = tierBadges[style.tier as keyof typeof tierBadges];
            
            return (
              <Card 
                key={style.name} 
                className={`overflow-hidden transition-all duration-200 ${
                  !available ? 'opacity-70' : 'hover:shadow-lg hover:transform hover:scale-[1.02]'
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  {!available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <Lock className="h-8 w-8 text-white mb-2" />
                        <Badge className={`${tierInfo.color} text-white`}>
                          {tierInfo.icon}
                          {style.tier} Plan Required
                        </Badge>
                      </div>
                    </div>
                  )}
                  <img 
                    src={style.imageUrl} 
                    alt={style.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${tierInfo.color} text-white`}>
                      {tierInfo.icon}
                      {style.tier}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-5">
                  <h3 className="text-xl font-semibold text-white mb-2">{style.name}</h3>
                  <p className="text-gray-300 mb-4">{style.description}</p>
                  
                  <div>
                    <p className="text-sm font-medium text-white mb-2">Example prompts:</p>
                    <ul className="text-sm text-gray-300">
                      {style.examples.map((example, index) => (
                        <li key={index} className="mb-1">• {example}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {available && (
                    <Link to="/">
                      <Button className="w-full mt-4 bg-imaginexus-accent1 hover:bg-imaginexus-accent1/90">
                        Try Now
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Styles;
