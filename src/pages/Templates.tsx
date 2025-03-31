import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Sparkles, 
  Mountain, 
  Building, 
  Users, 
  Rocket, 
  HardDrive, 
  Gamepad2, 
  Bookmark
} from 'lucide-react';

const Templates = () => {
  const categories = [
    { name: 'All Templates', icon: <ImageIcon size={18} /> },
    { name: 'Landscapes', icon: <Mountain size={18} /> },
    { name: 'Architecture', icon: <Building size={18} /> },
    { name: 'Characters', icon: <Users size={18} /> },
    { name: 'Sci-Fi', icon: <Rocket size={18} /> },
    { name: 'Abstract', icon: <HardDrive size={18} /> },
    { name: 'Gaming', icon: <Gamepad2 size={18} /> }
  ];
  
  const templates = [
    {
      id: 1,
      title: 'Mountain Valley Sunset',
      description: 'Breathtaking mountain landscape with a sunset and reflective lake',
      category: 'Landscapes',
      prompt: 'A majestic mountain valley with a calm lake reflecting the orange and purple sunset sky, with pine trees around the edges',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      saves: 324
    },
    {
      id: 2,
      title: 'Cyberpunk City',
      description: 'Futuristic cityscape with neon lights and flying vehicles',
      category: 'Sci-Fi',
      prompt: 'A sprawling cyberpunk megacity at night with towering skyscrapers, abundant neon signs in purples and blues, flying cars, and rain-slicked streets',
      imageUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
      saves: 256
    },
    {
      id: 3,
      title: 'Ghibli Forest Spirit',
      description: 'Mystical forest creature inspired by Studio Ghibli',
      category: 'Characters',
      prompt: 'A gentle forest spirit with glowing eyes sitting in a magical forest clearing surrounded by small glowing plants and mushrooms, in the style of Studio Ghibli',
      imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
      saves: 412
    },
    {
      id: 4,
      title: 'Gothic Cathedral',
      description: 'Detailed gothic cathedral with intricate architecture',
      category: 'Architecture',
      prompt: 'An imposing gothic cathedral with tall spires, flying buttresses, intricate stained glass windows, and detailed stone carvings, bathed in early morning light',
      imageUrl: 'https://images.unsplash.com/photo-1548248823-ce16a73b6d49',
      saves: 189
    },
    {
      id: 5,
      title: 'Cosmic Dreamscape',
      description: 'Abstract cosmic scene with vibrant colors and shapes',
      category: 'Abstract',
      prompt: 'An abstract cosmic dreamscape with swirling galaxies, vibrant nebulae in purples and blues, floating geometric shapes, and stars scattered across a deep space background',
      imageUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986',
      saves: 276
    },
    {
      id: 6,
      title: 'Fantasy Game Environment',
      description: 'Magical gaming environment with fantasy elements',
      category: 'Gaming',
      prompt: 'A fantasy game environment with floating islands connected by magical bridges, waterfalls flowing into the void below, ancient ruins, and a large magic crystal hovering in the center',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
      saves: 321
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Image Templates</h1>
        <p className="text-gray-400">Find and use pre-built prompts for stunning AI-generated images</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search templates..." 
            className="pl-9 bg-imaginexus-darker border-white/10"
          />
        </div>
        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>
      
      <Tabs defaultValue="All Templates">
        <TabsList className="bg-imaginexus-darker border border-white/10">
          {categories.map(cat => (
            <TabsTrigger
              key={cat.name}
              value={cat.name}
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <div className="flex items-center gap-2">
                {cat.icon}
                <span>{cat.name}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(cat => (
          <TabsContent key={cat.name} value={cat.name} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(t => cat.name === 'All Templates' || t.category === cat.name)
                .map(template => (
                  <Card key={template.id} className="border-white/10 bg-imaginexus-darker overflow-hidden card-hover">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={template.imageUrl} 
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{template.title}</CardTitle>
                          <CardDescription className="text-gray-400 mt-1">{template.description}</CardDescription>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black/20 rounded-md p-3 text-sm font-mono text-gray-300 overflow-hidden text-ellipsis">
                        {template.prompt}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <span className="text-xs text-gray-400">{template.saves} saves</span>
                      <Button size="sm" variant="default" className="bg-primary">
                        <Sparkles className="mr-2 h-3 w-3" />
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Templates;
