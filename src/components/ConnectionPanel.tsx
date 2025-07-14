import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { ConnectionConfig } from '@/types/chat';

interface ConnectionPanelProps {
  onConnect: (config: ConnectionConfig) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export const ConnectionPanel = ({ 
  onConnect, 
  onDisconnect, 
  isConnected, 
  isConnecting, 
  error 
}: ConnectionPanelProps) => {
  const [config, setConfig] = useState<ConnectionConfig>({
    serverUrl: 'ws://localhost:8080/ws/chat',
    jwtToken: '',
    userId: '',
    recipientId: ''
  });

  const handleConnect = () => {
    if (!config.serverUrl || !config.jwtToken || !config.userId || !config.recipientId) {
      return;
    }
    onConnect(config);
  };

  const getStatusBadge = () => {
    if (isConnecting) {
      return (
        <Badge variant="secondary" className="gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Connecting...
        </Badge>
      );
    }
    
    if (isConnected) {
      return (
        <Badge className="bg-success text-success-foreground gap-2">
          <Wifi className="h-3 w-3" />
          Connected
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive" className="gap-2">
        <WifiOff className="h-3 w-3" />
        Disconnected
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>WebSocket Connection</CardTitle>
            <CardDescription>
              Connect to your Go backend chat server
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="serverUrl">Server URL</Label>
          <Input
            id="serverUrl"
            value={config.serverUrl}
            onChange={(e) => setConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
            placeholder="ws://localhost:8080/ws/chat"
            disabled={isConnected || isConnecting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jwtToken">JWT Token</Label>
          <Input
            id="jwtToken"
            type="password"
            value={config.jwtToken}
            onChange={(e) => setConfig(prev => ({ ...prev, jwtToken: e.target.value }))}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            disabled={isConnected || isConnecting}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Your User ID</Label>
            <Input
              id="userId"
              value={config.userId}
              onChange={(e) => setConfig(prev => ({ ...prev, userId: e.target.value }))}
              placeholder="user123"
              disabled={isConnected || isConnecting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientId">Recipient ID</Label>
            <Input
              id="recipientId"
              value={config.recipientId}
              onChange={(e) => setConfig(prev => ({ ...prev, recipientId: e.target.value }))}
              placeholder="user456"
              disabled={isConnected || isConnecting}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <Separator />

        <div className="flex gap-2">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={!config.serverUrl || !config.jwtToken || !config.userId || !config.recipientId || isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={onDisconnect}
              variant="outline"
              className="flex-1"
            >
              <WifiOff className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Note:</strong> Since browser WebSockets don't support custom headers, the JWT token is sent as a query parameter.</p>
          <p>Your backend should expect: <code>?token=&lt;jwt&gt;&amp;userId=&lt;id&gt;</code></p>
        </div>
      </CardContent>
    </Card>
  );
};