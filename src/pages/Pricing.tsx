
import React from 'react';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  buttonText, 
  highlighted = false 
}: { 
  name: string; 
  price: string; 
  description: string; 
  features: string[];
  buttonText: string;
  highlighted?: boolean;
}) => (
  <div className={`rounded-lg p-6 ${highlighted ? 'border-2 border-imaginexus-accent1 bg-imaginexus-darker' : 'border border-gray-800 bg-imaginexus-darker/50'}`}>
    <h3 className="text-lg font-medium text-white">{name}</h3>
    <div className="mt-4 flex items-baseline">
      <span className="text-4xl font-bold text-white">{price}</span>
      {price !== 'Free' && <span className="ml-1 text-gray-400">/month</span>}
    </div>
    <p className="mt-4 text-gray-400">{description}</p>
    <ul className="mt-6 space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex">
          <Check className="h-5 w-5 text-imaginexus-accent1 shrink-0" />
          <span className="ml-3 text-gray-300">{feature}</span>
        </li>
      ))}
    </ul>
    <Button 
      className={`mt-8 w-full ${highlighted ? 'gradient-btn' : 'bg-imaginexus-darker border border-gray-700 hover:bg-gray-800'}`}
    >
      {buttonText}
    </Button>
  </div>
);

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4 text-white">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400">Choose the plan that's right for you and start creating amazing AI-generated images today.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier 
            name="Free" 
            price="Free" 
            description="Perfect for trying out ImagiNexus" 
            features={[
              "10 images per day",
              "Basic resolution (512x512)",
              "Standard styles only",
              "Community support"
            ]}
            buttonText="Get Started"
          />
          
          <PricingTier 
            name="Pro" 
            price="$19" 
            description="For creators and enthusiasts" 
            features={[
              "100 images per day",
              "HD resolution (1024x1024)",
              "All styles and filters",
              "Priority generation",
              "Email support"
            ]}
            buttonText="Subscribe"
            highlighted={true}
          />
          
          <PricingTier 
            name="Business" 
            price="$49" 
            description="For professional use cases" 
            features={[
              "Unlimited images",
              "4K resolution (2048x2048)",
              "All styles and filters",
              "API access",
              "Dedicated support",
              "Commercial license"
            ]}
            buttonText="Contact Sales"
          />
        </div>
      </main>
    </div>
  );
};

export default Pricing;
