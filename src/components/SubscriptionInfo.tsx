
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UserLimit } from '../services/imageService';
import { ArrowUpRight } from 'lucide-react';

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
        return 'bg-gray-600';
      case 'BASIC':
        return 'bg-blue-600';
      case 'PRO':
        return 'bg-purple-600';
      case 'UNLIMITED':
        return 'bg-amber-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  // Get progress bar color based on usage
  const getProgressColor = () => {
    if (usagePercentage > 90) return 'bg-red-500';
    if (usagePercentage > 70) return 'bg-orange-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="bg-imaginexus-darker rounded-lg border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className={`inline-block px-2 py-1 rounded text-xs text-white ${getBadgeColor()}`}>
            {userLimit.tier} PLAN
          </span>
        </div>
        {userLimit.tier !== 'UNLIMITED' && (
          <Link to="/pricing">
            <Button variant="outline" size="sm" className="h-8 text-xs border-gray-700 text-white">
              Upgrade <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-gray-300">Daily generation limit</span>
          <span className="text-white font-medium">
            {userLimit.imagesGenerated} / {userLimit.imagesLimit}
          </span>
        </div>
        <Progress 
          value={usagePercentage} 
          className="h-2 bg-gray-800" 
          indicatorClassName={getProgressColor()}
        />
      </div>
      
      {userLimit.tier !== 'UNLIMITED' && (
        <div className="text-sm text-gray-300">
          {remainingImages === 0 ? (
            <p>You've reached your daily limit. <Link to="/pricing" className="text-imaginexus-accent1 hover:underline">Upgrade your plan</Link> or wait until tomorrow for your limit to reset.</p>
          ) : (
            <p>You have <span className="text-white font-medium">{remainingImages}</span> generations remaining today.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionInfo;
