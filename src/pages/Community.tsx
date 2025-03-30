
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  MessageSquare,
  Share2,
  Star,
  User,
  Calendar,
  Sparkles,
  Users,
  Trending,
  Clock
} from 'lucide-react';

const Community = () => {
  const posts = [
    {
      id: 1,
      username: "CreativeMind",
      userAvatar: "https://i.pravatar.cc/150?img=1",
      title: "My first Ghibli-style landscape!",
      content: "Just tried the new Ghibli generator and I'm amazed at the results! Check out this countryside scene I created.",
      imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
      likes: 124,
      comments: 24,
      time: "2 hours ago",
      tags: ["ghibli", "landscape"]
    },
    {
      id: 2,
      username: "DigitalArtist",
      userAvatar: "https://i.pravatar.cc/150?img=2",
      title: "Cyberpunk city street - final version",
      content: "After 10+ iterations, I finally got the perfect prompt for this cyberpunk scene! What do you think?",
      imageUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986",
      likes: 86,
      comments: 15,
      time: "5 hours ago",
      tags: ["cyberpunk", "night", "city"]
    },
    {
      id: 3,
      username: "AIExplorer",
      userAvatar: "https://i.pravatar.cc/150?img=3",
      title: "Fantasy character portraits",
      content: "I've been experimenting with character generation. Here's a series of fantasy portraits I created using custom prompts.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
      likes: 203,
      comments: 42,
      time: "1 day ago",
      tags: ["characters", "fantasy", "portraits"]
    },
  ];
  
  const events = [
    {
      id: 1,
      title: "Weekly Prompt Challenge",
      description: "Join our weekly prompt challenge! This week's theme: 'Ancient Civilizations'",
      date: "Every Friday",
      attendees: 156,
      imageUrl: "https://images.unsplash.com/photo-1548248823-ce16a73b6d49",
    },
    {
      id: 2,
      title: "AI Art Workshop",
      description: "Learn advanced prompting techniques from professional AI artists",
      date: "Nov 15, 2023",
      attendees: 89,
      imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
    },
  ];
  
  const popularTags = [
    { name: "landscape", count: 1245 },
    { name: "portrait", count: 982 },
    { name: "ghibli", count: 756 },
    { name: "cyberpunk", count: 654 },
    { name: "space", count: 543 },
    { name: "fantasy", count: 432 },
    { name: "abstract", count: 321 },
    { name: "retro", count: 210 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-gray-400">Connect with others, share your creations, and get inspired</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="recent">
            <TabsList className="bg-imaginexus-darker border border-white/10 mb-6">
              <TabsTrigger
                value="recent"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                <Clock className="mr-2 h-4 w-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                <Trending className="mr-2 h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger
                value="starred"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                <Star className="mr-2 h-4 w-4" />
                Starred
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-6 mt-0">
              {posts.map(post => (
                <div key={post.id} className="rounded-lg border border-white/10 bg-imaginexus-darker overflow-hidden card-hover">
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img 
                          src={post.userAvatar} 
                          alt={post.username}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">{post.username}</p>
                        <p className="text-xs text-gray-400">{post.time}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mt-3">{post.title}</h3>
                    <p className="text-gray-300 mt-2">{post.content}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-white/5 text-gray-300 border-white/10">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  
                  <div className="p-4 flex items-center justify-between border-t border-white/10">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-1 text-gray-300 hover:text-primary">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-300 hover:text-primary">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                    <button className="text-gray-300 hover:text-primary">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full border-dashed border-white/20 bg-transparent hover:bg-white/5">
                Load More
              </Button>
            </TabsContent>
            
            <TabsContent value="trending" className="space-y-6 mt-0">
              <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                <Trending className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="text-xl font-medium mt-4">Trending content</h3>
                <p className="text-gray-400 mt-2">Discover what's popular in the community right now</p>
              </div>
            </TabsContent>
            
            <TabsContent value="starred" className="space-y-6 mt-0">
              <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                <Star className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="text-xl font-medium mt-4">Your starred content</h3>
                <p className="text-gray-400 mt-2">Save your favorite posts to find them easily later</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-imaginexus-darker p-5">
            <h3 className="font-medium flex items-center">
              <User className="mr-2 h-5 w-5" /> 
              My Profile
            </h3>
            <Button variant="outline" className="w-full mt-4 border-white/10 bg-white/5 hover:bg-white/10">
              Create New Post
            </Button>
          </div>
          
          <div className="rounded-lg border border-white/10 bg-imaginexus-darker p-5">
            <h3 className="font-medium flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Events
            </h3>
            <div className="mt-4 space-y-4">
              {events.map(event => (
                <div key={event.id} className="rounded border border-white/10 bg-white/5 overflow-hidden">
                  <img 
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-3">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                    <div className="flex justify-between items-center mt-3 text-xs">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Users className="h-3 w-3 mr-1" />
                        {event.attendees}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-lg border border-white/10 bg-imaginexus-darker p-5">
            <h3 className="font-medium flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Popular Tags
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <Badge key={tag.name} variant="outline" className="bg-white/5 hover:bg-white/10 text-gray-300 border-white/10">
                  #{tag.name}
                  <span className="ml-1 text-xs text-gray-400">{tag.count}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
