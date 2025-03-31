
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSubscription } from '../services/imageService';
import { toast } from 'sonner';
import RazorpayCheckout from '../components/RazorpayCheckout';

const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  tierCode,
  highlighted = false,
  currentTier,
  amountInPaise = 0
}: { 
  name: string;
  price: string;
  description: string;
  features: string[];
  tierCode: string;
  highlighted?: boolean;
  currentTier?: string;
  amountInPaise?: number;
}) => {
  const { currentUser } = useAuth();
  const isCurrentPlan = currentTier === tierCode;
  
  const handlePaymentSuccess = (paymentId: string) => {
    toast.success(`Payment successful! Payment ID: ${paymentId}`);
    // In a real app, you would update user subscription in your backend
  };
  
  return (
    <div className={`rounded-lg p-6 ${highlighted ? 'border-2 border-imaginexus-accent1 bg-black' : 'border border-gray-800 bg-black/50'}`}>
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
      
      <div className="mt-8">
        {isCurrentPlan ? (
          <Button 
            className="w-full bg-gray-700 hover:bg-gray-700 cursor-not-allowed"
            disabled
          >
            Current Plan
          </Button>
        ) : tierCode === "FREE" ? (
          <Button 
            className={`w-full ${highlighted ? 'gradient-btn' : 'bg-black border border-gray-700 hover:bg-gray-900'}`}
            onClick={() => toast.success(`Subscribed to Free plan!`)}
          >
            Get Started
          </Button>
        ) : (
          currentUser && (
            <RazorpayCheckout 
              amount={amountInPaise}
              planName={name}
              onSuccess={handlePaymentSuccess}
            />
          ) || (
            <Button 
              className={`w-full ${highlighted ? 'gradient-btn' : 'bg-black border border-gray-700 hover:bg-gray-900'}`}
              onClick={() => toast.info("Please sign in to subscribe")}
            >
              {`Subscribe to ${name}`}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

const Pricing = () => {
  const { currentUser } = useAuth();
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  
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
  
  return (
    <div className="min-h-screen flex flex-col bg-black">
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
            tierCode="FREE"
            currentTier={currentTier}
            amountInPaise={0}
          />
          
          <PricingTier 
            name="Basic" 
            price="₹299" 
            description="For casual creators" 
            features={[
              "15 images per day",
              "HD resolution (1024x1024)",
              "5 styles and filters",
              "Image-to-image generation",
              "Email support"
            ]}
            tierCode="BASIC"
            currentTier={currentTier}
            amountInPaise={29900}
          />
          
          <PricingTier 
            name="Pro" 
            price="₹799" 
            description="For creators and enthusiasts" 
            features={[
              "50 images per day",
              "HD resolution (2048x2048)",
              "Advanced styles including Ghibli",
              "Premium prompt enhancement",
              "Priority generation",
              "24/7 email support"
            ]}
            tierCode="PRO"
            highlighted={true}
            currentTier={currentTier}
            amountInPaise={79900}
          />
          
          <PricingTier 
            name="Unlimited" 
            price="₹2499" 
            description="For professional use cases" 
            features={[
              "1000 images per day",
              "4K resolution (4096x4096)",
              "All styles and filters",
              "API access",
              "Dedicated support",
              "Commercial license"
            ]}
            tierCode="UNLIMITED"
            currentTier={currentTier}
            amountInPaise={249900}
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
        
        <div className="mt-16 bg-black rounded-lg border border-gray-800 p-8 max-w-4xl mx-auto">
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
              <p className="text-gray-400">We accept all major credit cards, debit cards, UPI, and net banking via Razorpay.</p>
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
