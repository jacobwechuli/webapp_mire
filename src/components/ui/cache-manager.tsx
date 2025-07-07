import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheStats {
  dataCacheSize: number;
  userCacheSize: number;
}

interface CacheManagerProps {
  cacheStats: CacheStats | null;
  onClearCache: () => void;
  onRefreshStats: () => void;
  isLoading?: boolean;
}

export const CacheManager: React.FC<CacheManagerProps> = ({
  cacheStats,
  onClearCache,
  onRefreshStats,
  isLoading = false,
}) => {
  const { toast } = useToast();

  const handleClearCache = () => {
    onClearCache();
    toast({
      title: "Cache Cleared",
      description: "All cached data has been cleared successfully.",
    });
  };

  const handleRefreshStats = () => {
    onRefreshStats();
    toast({
      title: "Stats Updated",
      description: "Cache statistics have been refreshed.",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Cache Manager
        </CardTitle>
        <CardDescription>
          Monitor and manage application cache performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {cacheStats?.dataCacheSize || 0}
            </div>
            <div className="text-sm text-muted-foreground">Data Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cacheStats?.userCacheSize || 0}
            </div>
            <div className="text-sm text-muted-foreground">User Items</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleRefreshStats}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
          
          <Button
            onClick={handleClearCache}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Cache
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Data Cache TTL:</span>
            <Badge variant="secondary">10 min</Badge>
          </div>
          <div className="flex justify-between">
            <span>User Cache TTL:</span>
            <Badge variant="secondary">30 min</Badge>
          </div>
          <div className="flex justify-between">
            <span>API Cache TTL:</span>
            <Badge variant="secondary">2 min</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 