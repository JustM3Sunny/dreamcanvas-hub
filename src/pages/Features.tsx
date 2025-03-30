
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Zap, Code, Image as ImageIcon, GalleryVertical, Download, PanelRight, Users, Bot } from 'lucide-react';

const Features = () => {
  const featureCategories = [
    {
      title: "Image Generation",
      description: "Create stunning AI-generated images with powerful controls",
      features: [
        {
          icon: <ImageIcon className="h-6 w-6 text-primary" />,
          title: "AI Image Generator",
          description: "Create beautiful images with natural language prompts"
        },
        {
          icon: <GalleryVertical className="h-6 w-6 text-primary" />,
          title: "Ghibli Style Generator",
          description: "Generate images in the iconic Studio Ghibli style"
        },
        {
          icon: <Sparkles className="h-6 w-6 text-primary" />,
          title: "Multiple Styles",
          description: "Choose from various artistic styles for your images"
        }
      ]
    },
    {
      title: "Developer Tools",
      description: "Integrate our AI image generation into your own applications",
      features: [
        {
          icon: <Code className="h-6 w-6 text-primary" />,
          title: "API Access",
          description: "Generate images programmatically via our REST API"
        },
        {
          icon: <Download className="h-6 w-6 text-primary" />,
          title: "Batch Processing",
          description: "Generate multiple images in one API request"
        },
        {
          icon: <PanelRight className="h-6 w-6 text-primary" />,
          title: "Custom UI Integration",
          description: "Add image generation to your app with our SDK"
        }
      ]
    },
    {
      title: "Community & Support",
      description: "Connect with other users and get help when you need it",
      features: [
        {
          icon: <Users className="h-6 w-6 text-primary" />,
          title: "User Community",
          description: "Share your creations and get inspired by others"
        },
        {
          icon: <Bot className="h-6 w-6 text-primary" />,
          title: "AI Assistant",
          description: "Get help with prompts and image generation"
        },
        {
          icon: <Zap className="h-6 w-6 text-primary" />,
          title: "Priority Support",
          description: "Get help quickly from our dedicated support team"
        }
      ]
    }
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Basic access to core image generation features",
      features: [
        "10 images per day",
        "Standard generation quality",
        "5 Ghibli style images",
        "Community access"
      ]
    },
    {
      name: "Basic",
      price: "$9.99",
      period: "per month",
      description: "Everything in Free plus increased limits and quality",
      features: [
        "50 images per day",
        "Enhanced generation quality",
        "10 Ghibli style images",
        "Basic API access",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "per month",
      description: "Professional-grade image generation for serious creators",
      features: [
        "200 images per day",
        "Maximum quality generation",
        "Unlimited Ghibli style images",
        "Full API access",
        "Batch processing",
        "Custom integration tools"
      ]
    }
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Powerful AI Image Generation</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Unlock creative possibilities with our advanced AI image generation platform
        </p>
      </div>
      
      {/* Feature Categories */}
      {featureCategories.map((category, index) => (
        <section key={index} className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">{category.title}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{category.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {category.features.map((feature, featureIndex) => (
              <div key={featureIndex} className="feature-item card-hover">
                <div className="icon-box">{feature.icon}</div>
                <h3 className="text-lg font-medium mt-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
      
      {/* Pricing Section */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Choose the plan that fits your creative needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, index) => (
            <div 
              key={index} 
              className={`rounded-xl border ${tier.popular ? 'border-primary/30 bg-primary/5' : 'border-white/10 bg-white/5'} p-6 relative card-hover`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-gray-400 ml-1">{tier.period}</span>
              </div>
              <p className="text-sm text-gray-400 mt-3">{tier.description}</p>
              
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full mt-6 ${tier.popular ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                asChild
              >
                <Link to="/pricing">Choose {tier.name}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent2/20 border border-white/10 p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold">Ready to start creating?</h2>
        <p className="text-xl text-gray-300 mt-4 max-w-2xl mx-auto">
          Join thousands of creators using our AI image generation platform today.
        </p>
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" className="border-white/20 bg-black/20 hover:bg-black/40 text-white px-8">
            View Gallery
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Features;
