
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface RazorpayCheckoutProps {
  amount: number; // amount in paise/cents
  planName: string;
  onSuccess?: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({ 
  amount, 
  planName,
  onSuccess,
  onFailure
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };
  
  const handlePayment = async () => {
    if (!currentUser) {
      toast.error("Please sign in to subscribe");
      return;
    }
    
    setLoading(true);
    
    try {
      await loadRazorpayScript();
      
      // In a real app, you would get orderId from your backend
      const orderId = "order_" + Math.random().toString(36).substring(2, 15);
      
      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual key in production
        amount: amount,
        currency: "INR",
        name: "Imagicaaa",
        description: `Subscription to ${planName} Plan`,
        order_id: orderId,
        prefill: {
          name: currentUser.displayName || "",
          email: currentUser.email || "",
        },
        theme: {
          color: "#9b87f5"
        },
        handler: function(response: any) {
          // Payment successful
          toast.success(`Successfully subscribed to ${planName} plan!`);
          if (onSuccess) onSuccess(response.razorpay_payment_id);
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Payment failed. Please try again.");
      if (onFailure) onFailure(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={loading ? 'bg-gray-700 hover:bg-gray-700 cursor-not-allowed' : 'gradient-btn'}
    >
      {loading ? 'Processing...' : `Subscribe to ${planName}`}
    </Button>
  );
};

export default RazorpayCheckout;
