
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Heart, 
  Share2Icon,
  UserIcon,
  CalendarIcon,
  SparklesIcon,
  Users
} from 'lucide-react';

const Community = () => {
  const featuredPosts = [
    {
      id: 1,
      title: "My first Ghibli-inspired landscape",
      author: "Sarah Chen",
      authorAvatar: "https://i.pravatar.cc/150?img=32",
      date: "2 days ago",
      likes: 124,
      comments: 32,
      shares: 18,
      tags: ["landscape", "ghibli", "nature"],
      content: "I used the Ghibli generator to create this beautiful landscape. It reminds me of scenes from Princess Mononoke. The AI captured the essence perfectly!",
      image: "https://images.unsplash.com/photo-1623625434462-e5e42318ae49?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Creating Ghibli-style character portraits",
      author: "Marcus Johnson",
      authorAvatar: "https://i.pravatar.cc/150?img=11",
      date: "5 days ago",
      likes: 89,
      comments: 21,
      shares: 9,
      tags: ["characters", "portrait", "tutorial"],
      content: "Here's my process for creating character portraits in Ghibli style. I'll walk you through the settings and prompts I used to achieve this look.",
      image: "https://images.unsplash.com/photo-1598089842345-111a2ef06faa?q=80&w=1000&auto=format&fit=crop"
    }
  ];
  
  const recentPosts = [
    {
      id: 3,
      title: "How to achieve that Ghibli cloud effect",
      author: "Emma Wilson",
      authorAvatar: "https://i.pravatar.cc/150?img=23",
      date: "Yesterday",
      likes: 43,
      comments: 7,
      shares: 5,
      tags: ["clouds", "tutorial", "landscape"],
      content: "I've been experimenting with the cloud effects in my generated images. Here are some tips to get those iconic fluffy Ghibli clouds."
    },
    {
      id: 4,
      title: "My Ghibli-inspired short story illustrations",
      author: "David Park",
      authorAvatar: "https://i.pravatar.cc/150?img=53",
      date: "3 days ago",
      likes: 67,
      comments: 14,
      shares: 8,
      tags: ["story", "illustration", "characters"],
      content: "I wrote a short story and used Imagicaaa to illustrate each scene in Ghibli style. Here's how the project turned out!"
    },
    {
      id: 5,
      title: "Weekly prompt challenge: Magical forests",
      author: "Community Team",
      authorAvatar: "https://i.pravatar.cc/150?img=68",
      date: "4 days ago",
      likes: 112,
      comments: 47,
      shares: 23,
      tags: ["challenge", "prompt", "forest"],
      content: "This week's community challenge is to create magical forest scenes inspired by Ghibli. Share your creations below!"
    }
  ];
  
  const popularUsers = [
    {
      name: "Olivia Moore",
      avatar: "https://i.pravatar.cc/150?img=47",
      bio: "Digital artist and Ghibli enthusiast",
      followers: 1243
    },
    {
      name: "James Wilson",
      avatar: "https://i.pravatar.cc/150?img=12",
      bio: "Animation student | Lover of all things Miyazaki",
      followers: 876
    },
    {
      name: "Sophia Chen",
      avatar: "https://i.pravatar.cc/150?img=44",
      bio: "Illustrator and storyteller | Creating magical worlds",
      followers: 2109
    }
  ];
  
  const upcomingEvents = [
    {
      title: "Ghibli Art Challenge",
      date: "October 15, 2023",
      description: "A week-long challenge to create Ghibli-inspired art pieces."
    },
    {
      title: "Community Livestream: Prompt Engineering",
      date: "October 22, 2023",
      description: "Learn how to craft the perfect prompts for Ghibli-style generation."
    },
    {
      title: "Monthly Showcase",
      date: "October 30, 2023",
      description: "Share and celebrate the best community creations of the month."
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-gray-400">Connect with fellow creators, share your work, and get inspired</p>
      </div>
      
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create post */}
              <Card className="border-white/10 bg-imaginexus-darker shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src="https://i.pravatar.cc/150?img=32" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea placeholder="Share your creations or thoughts..." className="bg-imaginexus-dark border-white/10" />
                      <div className="flex justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/5">
                            <UserIcon size={16} className="mr-2" />
                            Tag People
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/5">
                            <CalendarIcon size={16} className="mr-2" />
                            Event
                          </Button>
                        </div>
                        <Button className="gradient-btn" size="sm">Share</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Featured posts */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Featured</h3>
                
                {featuredPosts.map(post => (
                  <Card key={post.id} className="border-white/10 bg-imaginexus-darker shadow-lg overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full object-cover h-full" />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.authorAvatar} />
                            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{post.author}</p>
                            <p className="text-gray-400 text-sm flex items-center">
                              <CalendarIcon size={14} className="mr-1" />
                              {post.date}
                            </p>
                          </div>
                        </div>
                        <div>
                          {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="ml-1 bg-primary/20 hover:bg-primary/30 text-white">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">{post.content}</p>
                    </CardContent>
                    <CardFooter className="border-t border-white/10 flex justify-between">
                      <div className="flex gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Heart size={16} className="mr-1" /> {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <MessageSquare size={16} className="mr-1" /> {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Share2Icon size={16} className="mr-1" /> {post.shares}
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/5">
                        View Discussion
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {/* Recent Posts */}
                <h3 className="text-xl font-bold text-white mt-8">Recent Posts</h3>
                
                {recentPosts.map(post => (
                  <Card key={post.id} className="border-white/10 bg-imaginexus-darker shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.authorAvatar} />
                            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{post.author}</p>
                            <p className="text-gray-400 text-sm flex items-center">
                              <CalendarIcon size={14} className="mr-1" />
                              {post.date}
                            </p>
                          </div>
                        </div>
                        <div>
                          {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="ml-1 bg-primary/20 hover:bg-primary/30 text-white">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">{post.content}</p>
                    </CardContent>
                    <CardFooter className="border-t border-white/10 flex justify-between">
                      <div className="flex gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Heart size={16} className="mr-1" /> {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <MessageSquare size={16} className="mr-1" /> {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Share2Icon size={16} className="mr-1" /> {post.shares}
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/5">
                        View Discussion
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Popular users */}
              <Card className="border-white/10 bg-imaginexus-darker shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Popular Creators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {popularUsers.map((user, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{user.name}</p>
                        <p className="text-gray-400 text-xs truncate">{user.bio}</p>
                      </div>
                      <Button size="sm" variant="outline" className="bg-transparent border-white/10 hover:bg-white/5">
                        Follow
                      </Button>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="border-t border-white/10">
                  <Button variant="ghost" size="sm" className="w-full">View All</Button>
                </CardFooter>
              </Card>
              
              {/* Upcoming events */}
              <Card className="border-white/10 bg-imaginexus-darker shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <SparklesIcon size={16} className="text-primary" />
                        <h4 className="text-white font-medium">{event.title}</h4>
                      </div>
                      <p className="text-gray-400 text-xs flex items-center">
                        <CalendarIcon size={12} className="mr-1" />
                        {event.date}
                      </p>
                      <p className="text-gray-300 text-sm">{event.description}</p>
                      {index < upcomingEvents.length - 1 && <Separator className="bg-white/10 my-2" />}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="border-t border-white/10">
                  <Button variant="ghost" size="sm" className="w-full">View All Events</Button>
                </CardFooter>
              </Card>
              
              {/* Community stats */}
              <Card className="border-white/10 bg-imaginexus-darker shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Community Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-black/20 rounded-lg">
                      <h3 className="text-2xl font-bold text-white">8.4k</h3>
                      <p className="text-gray-400 text-sm">Members</p>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded-lg">
                      <h3 className="text-2xl font-bold text-white">23k</h3>
                      <p className="text-gray-400 text-sm">Creations</p>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded-lg">
                      <h3 className="text-2xl font-bold text-white">142</h3>
                      <p className="text-gray-400 text-sm">Online Now</p>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded-lg">
                      <h3 className="text-2xl font-bold text-white">3.6k</h3>
                      <p className="text-gray-400 text-sm">Posts Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="discover">
          <div className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Discover creators</h3>
            <p className="text-gray-400 mb-4">Find and follow creators that match your interests</p>
            <Button className="gradient-btn">Browse Categories</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="events">
          <div className="p-8 text-center">
            <CalendarIcon size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Community Events</h3>
            <p className="text-gray-400 mb-4">Participate in challenges, workshops, and more</p>
            <Button className="gradient-btn">View Calendar</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="challenges">
          <div className="p-8 text-center">
            <SparklesIcon size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Weekly Challenges</h3>
            <p className="text-gray-400 mb-4">Join the weekly prompt challenges and showcase your work</p>
            <Button className="gradient-btn">Current Challenge</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;
