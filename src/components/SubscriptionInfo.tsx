
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UserLimit, getRemainingTimeUntilReset } from '../services/imageService';
import { ArrowUpRight, Clock, Sparkles } from 'lucide-react';

interface SubscriptionInfoProps {
  userLimit: UserLimit;
}

const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({ userLimit }) => {
  const usagePercentage = (userLimit.imagesGenerated / userLimit.imagesLimit) * 100;
  const remainingImages = userLimit.imagesLimit - userLimit.imagesGenerated;
  
  // Get badge color based on tier
  const getBadgeColor = () => {
    switch (userLimit.tier) {
      case 'FREE':
        return 'bg-gray-800 border border-gray-700';
      case 'BASIC':
        return 'bg-blue-900/50 border border-blue-600/30';
      case 'PRO':
        return 'bg-purple-900/50 border border-purple-600/30';
      case 'UNLIMITED':
        return 'bg-amber-900/50 border border-amber-600/30';
      default:
        return 'bg-gray-800 border border-gray-700';
    }
  };
  
  // Get progress bar color based on usage
  const getProgressColor = () => {
    if (usagePercentage > 90) return 'bg-red-500';
    if (usagePercentage > 70) return 'bg-orange-500';
    return 'bg-primary';
  };
  
  // Calculate time until quota resets
  const timeUntilReset = getRemainingTimeUntilReset(userLimit.lastRefresh);
  
  return (
    <div className="bg-imaginexus-darker rounded-xl border border-white/10 p-5 shadow-lg shadow-primary/5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${getBadgeColor()}`}>
            {userLimit.tier} PLAN <Sparkles className="ml-1 h-3 w-3" />
          </span>
        </div>
        {userLimit.tier !== 'UNLIMITED' && (
          <Link to="/pricing">
            <Button variant="outline" size="sm" className="h-8 text-xs border-white/10 bg-white/5 text-white hover:bg-white/10">
              Upgrade <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5 text-sm">
          <span className="text-gray-300">Daily generation limit</span>
          <span className="text-white font-medium">
            {userLimit.imagesGenerated} / {userLimit.imagesLimit}
          </span>
        </div>
        <Progress 
          value={usagePercentage} 
          className="h-2 bg-white/5" 
          indicatorClassName={getProgressColor()}
        />
      </div>
      
      {userLimit.imagesGenerated >= userLimit.imagesLimit ? (
        <div className="text-sm">
          <div className="flex items-center gap-2 text-amber-400 mb-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Quota resets in: {timeUntilReset}</span>
          </div>
          <p className="text-gray-300">
            <Link to="/pricing" className="text-primary hover:underline">Upgrade your plan</Link> for more generations.
          </p>
        </div>
      ) : (
        <div className="text-sm text-gray-300">
          <p>You have <span className="text-white font-medium">{remainingImages}</span> generations remaining today.</p>
          <div className="flex items-center gap-1 text-gray-400 mt-1.5">
            <Clock className="h-3 w-3" />
            <span className="text-xs">Resets in {timeUntilReset}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionInfo;
