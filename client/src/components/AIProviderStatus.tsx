
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function AIProviderStatus() {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['/api/ai/providers'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking AI status...</span>
      </div>
    );
  }

  const availableCount = providers?.availableCount || 0;
  const isOnline = availableCount > 0;

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-200">AI ENGINE</span>
          {isOnline ? (
            <Badge className="bg-green-500 text-white flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              ONLINE
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              OFFLINE
            </Badge>
          )}
        </div>
        
        <div className="text-xs text-gray-400">
          {isOnline ? (
            <>
              {providers?.providers?.openai?.available && (
                <div>✓ OpenAI GPT-4 Turbo</div>
              )}
              {providers?.providers?.anthropic?.available && (
                <div>✓ Anthropic Claude</div>
              )}
              {availableCount} provider{availableCount !== 1 ? 's' : ''} active
            </>
          ) : (
            <div>No AI providers available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
