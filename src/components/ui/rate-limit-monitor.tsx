import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  endpoint: string;
}

interface RateLimitMonitorProps {
  endpoint: string;
  onRateLimitExceeded?: (info: RateLimitInfo) => void;
}

export const RateLimitMonitor: React.FC<RateLimitMonitorProps> = ({
  endpoint,
  onRateLimitExceeded,
}) => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [isExceeded, setIsExceeded] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState(0);

  useEffect(() => {
    // Simulate rate limit info (in real app, this would come from API response headers)
    const mockRateLimitInfo: RateLimitInfo = {
      limit: 10,
      remaining: 7,
      reset: Date.now() + 60000, // 1 minute from now
      endpoint,
    };

    setRateLimitInfo(mockRateLimitInfo);
    setIsExceeded(mockRateLimitInfo.remaining === 0);
  }, [endpoint]);

  useEffect(() => {
    if (!rateLimitInfo) return;

    const updateTimeUntilReset = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, rateLimitInfo.reset - now);
      setTimeUntilReset(Math.ceil(timeLeft / 1000));
    };

    updateTimeUntilReset();
    const interval = setInterval(updateTimeUntilReset, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo]);

  useEffect(() => {
    if (isExceeded && onRateLimitExceeded && rateLimitInfo) {
      onRateLimitExceeded(rateLimitInfo);
    }
  }, [isExceeded, onRateLimitExceeded, rateLimitInfo]);

  if (!rateLimitInfo) {
    return null;
  }

  const usagePercentage = ((rateLimitInfo.limit - rateLimitInfo.remaining) / rateLimitInfo.limit) * 100;
  const isHighUsage = usagePercentage > 80;
  const isCritical = usagePercentage > 95;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {isExceeded ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : isCritical ? (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          ) : isHighUsage ? (
            <Clock className="h-4 w-4 text-yellow-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          Rate Limit Status
        </CardTitle>
        <CardDescription>
          {endpoint} endpoint usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Usage</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {rateLimitInfo.remaining} / {rateLimitInfo.limit}
            </span>
            <Badge 
              variant={
                isExceeded ? "destructive" : 
                isCritical ? "destructive" : 
                isHighUsage ? "secondary" : "default"
              }
            >
              {isExceeded ? "Exceeded" : 
               isCritical ? "Critical" : 
               isHighUsage ? "High" : "Normal"}
            </Badge>
          </div>
        </div>

        <Progress 
          value={usagePercentage} 
          className={`h-2 ${
            isExceeded ? "bg-red-100" : 
            isCritical ? "bg-orange-100" : 
            isHighUsage ? "bg-yellow-100" : "bg-green-100"
          }`}
        />

        {isExceeded && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Rate limit exceeded. Reset in {timeUntilReset}s</span>
            </div>
          </div>
        )}

        {!isExceeded && isHighUsage && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>High usage. Consider slowing down requests.</span>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <div>Limit: {rateLimitInfo.limit} requests per minute</div>
          <div>Reset: {new Date(rateLimitInfo.reset).toLocaleTimeString()}</div>
        </div>
      </CardContent>
    </Card>
  );
};

// Hook for managing rate limit state
export const useRateLimit = (endpoint: string) => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  const handleRateLimitExceeded = (info: RateLimitInfo) => {
    setIsRateLimited(true);
    setRetryAfter(Math.ceil((info.reset - Date.now()) / 1000));
  };

  const resetRateLimit = () => {
    setIsRateLimited(false);
    setRetryAfter(0);
  };

  return {
    isRateLimited,
    retryAfter,
    handleRateLimitExceeded,
    resetRateLimit,
  };
}; 