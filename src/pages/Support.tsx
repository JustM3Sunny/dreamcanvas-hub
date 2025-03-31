import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  HelpCircle,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  Video,
  Lightbulb,
  Image,
  Sparkles,
  FileQuestion,
  Palette
} from 'lucide-react';

const Support = () => {
  const supportCategories = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Documentation",
      description: "Browse our guides and documentation",
      action: "Read Docs"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Live Chat",
      description: "Chat with our support team",
      action: "Start Chat"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Get help via email",
      action: "Send Email"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Tutorials",
      description: "Learn with our video guides",
      action: "Watch Now"
    },
  ];
  
  const faqs = [
    {
      question: "How many images can I generate per day?",
      answer: "The number of images you can generate depends on your plan. Free users get 10 images per day, Basic plan users get 50 images per day, and Pro plan users get 200 images per day. Unused quota does not roll over to the next day."
    },
    {
      question: "What is the Ghibli Generator?",
      answer: "The Ghibli Generator is our specialized AI model that creates images in the distinct style of Studio Ghibli animations. Each plan has a specific allocation for Ghibli-style images, which is separate from your regular generation quota."
    },
    {
      question: "How do I access the API?",
      answer: "API access is available on paid plans. You can find your API key and documentation in the API section of your dashboard. The API allows you to generate images programmatically for integration into your own applications."
    },
    {
      question: "Can I download the images I generate?",
      answer: "Yes, all users can download the images they generate in standard resolution. Premium users can also download higher resolution versions and access additional export formats."
    },
    {
      question: "Do I own the images I create?",
      answer: "Yes, you own the rights to use the images you generate with our platform. However, please review our terms of service for specific details about commercial usage depending on your plan."
    },
  ];
  
  const articles = [
    {
      title: "Getting Started with Prompts",
      excerpt: "Learn how to write effective prompts for better image generation results.",
      icon: <Lightbulb />
    },
    {
      title: "Advanced Style Controls",
      excerpt: "Master the art of controlling image styles and aesthetics with our advanced options.",
      icon: <Palette />
    },
    {
      title: "Optimizing Ghibli Generation",
      excerpt: "Tips and tricks for creating the perfect Studio Ghibli style images.",
      icon: <Sparkles />
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-gray-400">Get help and learn how to get the most from our platform</p>
      </div>
      
      {/* Support Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {supportCategories.map((category, index) => (
          <Card key={index} className="border-white/10 bg-imaginexus-darker card-hover">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center text-primary">
                {category.icon}
              </div>
              <CardTitle className="mt-2">{category.title}</CardTitle>
              <CardDescription className="text-gray-400">{category.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10">
                {category.action}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Contact Form and FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Contact Form */}
        <Card className="lg:col-span-2 border-white/10 bg-imaginexus-darker">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Contact Us
            </CardTitle>
            <CardDescription className="text-gray-400">
              Send us a message and we'll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input id="name" placeholder="Your name" className="bg-imaginexus-darker border-white/10" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" placeholder="Your email" type="email" className="bg-imaginexus-darker border-white/10" />
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject</label>
              <Input id="subject" placeholder="How can we help?" className="bg-imaginexus-darker border-white/10" />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <Textarea id="message" placeholder="Please describe your issue in detail..." className="min-h-[120px] bg-imaginexus-darker border-white/10" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary hover:bg-primary/90">Send Message</Button>
          </CardFooter>
        </Card>
        
        {/* FAQs */}
        <Card className="lg:col-span-3 border-white/10 bg-imaginexus-darker">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                  <AccordionTrigger className="text-sm font-medium hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400 text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
      
      {/* Help Articles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Helpful Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.map((article, index) => (
            <Card key={index} className="border-white/10 bg-imaginexus-darker card-hover">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-primary">
                  {article.icon}
                </div>
                <CardTitle className="text-lg mt-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{article.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="text-primary hover:bg-white/5 hover:text-primary w-full">
                  Read Article
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Support;
