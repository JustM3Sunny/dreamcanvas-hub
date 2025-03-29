
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserSubscription, getUserSubscription } from '../services/imageService';
import { toast } from 'sonner';

const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  buttonText,
  tierCode,
  highlighted = false,
  currentTier,
  onSelectPlan,
  loading = false
}: { 
  name: string; 
  price: string; 
  description: string; 
  features: string[];
  buttonText: string;
  tierCode: string;
  highlighted?: boolean;
  currentTier?: string;
  onSelectPlan: (tier: string) => void;
  loading?: boolean;
}) => {
  const isCurrentPlan = currentTier === tierCode;
  
  return (
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
        className={`mt-8 w-full ${
          isCurrentPlan 
            ? 'bg-gray-700 hover:bg-gray-700 cursor-not-allowed' 
            : highlighted 
              ? 'gradient-btn' 
              : 'bg-imaginexus-darker border border-gray-700 hover:bg-gray-800'
        }`}
        disabled={isCurrentPlan || loading}
        onClick={() => !isCurrentPlan && onSelectPlan(tierCode)}
      >
        {isCurrentPlan ? 'Current Plan' : loading ? 'Processing...' : buttonText}
      </Button>
    </div>
  );
};

const Pricing = () => {
  const { currentUser } = useAuth();
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
    const loadUserSubscription = async () => {
      if (currentUser) {
        try {
          const subscription = await getUserSubscription(currentUser.uid);
          setCurrentTier(subscription.tier);
        } catch (error) {
          console.error("Error loading subscription:", error);
        }
      }
    };
    
    loadUserSubscription();
  }, [currentUser]);
  
  const handleSelectPlan = async (tier: string) => {
    if (!currentUser) {
      toast.error("Please sign in to subscribe");
      return;
    }
    
    setLoading(true);
    try {
      // In a real app, this would include payment processing
      const success = await updateUserSubscription(currentUser.uid, tier);
      if (success) {
        setCurrentTier(tier);
        toast.success(`Successfully subscribed to ${tier} plan`);
      } else {
        throw new Error("Failed to update subscription");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4 text-white">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400">Choose the plan that's right for you and start creating amazing AI-generated images today.</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <PricingTier 
            name="Free" 
            price="Free" 
            description="Perfect for trying out Imagicaaa" 
            features={[
              "5 images per day",
              "Basic resolution (512x512)",
              "Standard styles only",
              "Community support",
              "Basic prompt enhancement"
            ]}
            buttonText="Get Started"
            tierCode="FREE"
            currentTier={currentTier}
            onSelectPlan={handleSelectPlan}
            loading={loading}
          />
          
          <PricingTier 
            name="Basic" 
            price="$9" 
            description="For casual creators" 
            features={[
              "15 images per day",
              "HD resolution (1024x1024)",
              "5 styles and filters",
              "Image-to-image generation",
              "Email support"
            ]}
            buttonText="Subscribe"
            tierCode="BASIC"
            currentTier={currentTier}
            onSelectPlan={handleSelectPlan}
            loading={loading}
          />
          
          <PricingTier 
            name="Pro" 
            price="$19" 
            description="For creators and enthusiasts" 
            features={[
              "50 images per day",
              "HD resolution (2048x2048)",
              "Advanced styles including Ghibli",
              "Premium prompt enhancement",
              "Priority generation",
              "24/7 email support"
            ]}
            buttonText="Subscribe"
            tierCode="PRO"
            highlighted={true}
            currentTier={currentTier}
            onSelectPlan={handleSelectPlan}
            loading={loading}
          />
          
          <PricingTier 
            name="Unlimited" 
            price="$49" 
            description="For professional use cases" 
            features={[
              "1000 images per day",
              "4K resolution (4096x4096)",
              "All styles and filters",
              "API access",
              "Dedicated support",
              "Commercial license"
            ]}
            buttonText="Contact Sales"
            tierCode="UNLIMITED"
            currentTier={currentTier}
            onSelectPlan={handleSelectPlan}
            loading={loading}
          />
        </div>
        
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">Enterprise Solutions</h2>
          <p className="text-gray-400 mb-8">Need a custom solution for your business? We offer flexible enterprise plans tailored to your specific requirements.</p>
          <Button 
            className="gradient-btn px-8 py-6"
            onClick={() => toast.info("Enterprise contact feature coming soon!")}
          >
            Contact Enterprise Sales
          </Button>
        </div>
        
        <div className="mt-16 bg-imaginexus-darker rounded-lg border border-gray-800 p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">How are daily limits calculated?</h3>
              <p className="text-gray-400">Daily limits reset at midnight UTC. Unused generations don't roll over to the next day.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-400">Yes, you can change your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards, PayPal, and selected cryptocurrencies.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400">We offer full refunds within 7 days of purchase if you're not satisfied with our service.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
