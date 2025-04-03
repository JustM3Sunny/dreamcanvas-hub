
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSubscription } from '../services/imageService';
import { toast } from 'sonner';
import RazorpayCheckout from '../components/RazorpayCheckout';
import { motion } from 'framer-motion';

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
    <motion.div 
      whileHover={{ y: -5 }}
      className={`rounded-xl p-6 ${highlighted 
        ? 'bg-gradient-to-b from-black to-indigo-950/30 border border-indigo-500/30' 
        : 'bg-black border border-white/10'}`}
    >
      <h3 className="text-lg font-medium text-white">{name}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-bold text-white">{price}</span>
        {price !== 'Free' && <span className="ml-1 text-gray-400">/month</span>}
      </div>
      <p className="mt-4 text-gray-400">{description}</p>
      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex">
            <Check className="h-5 w-5 text-indigo-500 shrink-0" />
            <span className="ml-3 text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-8">
        {isCurrentPlan ? (
          <Button 
            className="w-full bg-indigo-500/20 text-indigo-300 cursor-not-allowed hover:bg-indigo-500/20"
            disabled
          >
            Current Plan
          </Button>
        ) : tierCode === "FREE" ? (
          <Button 
            className={`w-full ${highlighted 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-black border border-white/20 hover:bg-white/10'}`}
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
              className={`w-full ${highlighted 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-black border border-white/20 hover:bg-white/10'}`}
              onClick={() => toast.info("Please sign in to subscribe")}
            >
              {`Subscribe to ${name}`}
            </Button>
          )
        )}
      </div>
    </motion.div>
  );
};

const Pricing = () => {
  const { currentUser } = useAuth();
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  
  useEffect(() => {
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
  
  // Discounted prices (63% off)
  const originalPrices = { basic: 299, pro: 799, unlimited: 2499 };
  const discountedPrices = {
    basic: Math.round(originalPrices.basic * 0.37), // ₹111
    pro: Math.round(originalPrices.pro * 0.37),     // ₹296
    unlimited: Math.round(originalPrices.unlimited * 0.37) // ₹925
  };
  
  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl font-bold mb-4 text-white">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400">Choose the plan that's right for you and start creating amazing AI-generated images today.</p>
          <div className="mt-6 inline-block bg-indigo-900/30 px-4 py-2 rounded-full text-indigo-300 border border-indigo-500/30">
            <span className="font-medium">Limited Time Offer:</span> 63% off on all plans
          </div>
        </motion.div>
        
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
            price={`₹${discountedPrices.basic}`}
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
            amountInPaise={discountedPrices.basic * 100}
          />
          
          <PricingTier 
            name="Pro" 
            price={`₹${discountedPrices.pro}`}
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
            amountInPaise={discountedPrices.pro * 100}
          />
          
          <PricingTier 
            name="Unlimited" 
            price={`₹${discountedPrices.unlimited}`}
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
            amountInPaise={discountedPrices.unlimited * 100}
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4 text-white">Enterprise Solutions</h2>
          <p className="text-gray-400 mb-8">Need a custom solution for your business? We offer flexible enterprise plans tailored to your specific requirements.</p>
          <Button 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-6"
            onClick={() => toast.info("Enterprise contact feature coming soon!")}
          >
            Contact Enterprise Sales
          </Button>
        </motion.div>
        
        <div className="mt-16 bg-black rounded-lg border border-white/10 p-8 max-w-4xl mx-auto">
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
