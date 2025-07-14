import { ConnectionPanel } from './ConnectionPanel';
import { ChatInterface } from './ChatInterface';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ConnectionConfig } from '@/types/chat';

export const ChatTester = () => {
  const { state, connect, disconnect, sendMessage } = useWebSocket();

  const handleConnect = (config: ConnectionConfig) => {
    connect(config);
  };

  const handleSendMessage = (content: string, toId: string) => {
    sendMessage(content, toId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-chat-sidebar to-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            WebSocket Chat Tester
          </h1>
          <p className="text-muted-foreground text-lg">
            Test your Go backend WebSocket chat endpoint with real-time messaging
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <ConnectionPanel
            onConnect={handleConnect}
            onDisconnect={disconnect}
            isConnected={state.isConnected}
            isConnecting={state.isConnecting}
            error={state.error}
          />

          {state.isConnected && (
            <ChatInterface
              messages={state.messages}
              currentUserId={state.isConnected ? "your-user-id" : ""}
              recipientId="recipient-id"
              isConnected={state.isConnected}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>

        {/* Documentation Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">WebSocket Implementation Notes</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Authentication Workaround</h3>
                <p className="text-muted-foreground mb-2">
                  Since browser WebSockets don't support custom headers (like Authorization: Bearer), 
                  this implementation uses query parameters for JWT authentication:
                </p>
                <code className="block bg-muted p-3 rounded text-sm">
                  ws://localhost:8080/ws/chat?token=&lt;jwt-token&gt;&amp;userId=&lt;user-id&gt;
                </code>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Alternative Solutions</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Query Parameters:</strong> Current implementation (recommended for testing)</li>
                  <li><strong>WebSocket Subprotocols:</strong> Use the Sec-WebSocket-Protocol header</li>
                  <li><strong>Initial Message:</strong> Send auth token as first WebSocket message</li>
                  <li><strong>Proxy Server:</strong> Use a proxy that can add headers</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Expected Message Format</h3>
                <p className="text-muted-foreground mb-2">Outgoing messages (sent to server):</p>
                <code className="block bg-muted p-3 rounded text-sm mb-4">
{`{
  "type": "message",
  "content": "Hello world!",
  "toId": "recipient-user-id",
  "fromId": "sender-user-id",
  "timestamp": "2024-01-01T12:00:00Z"
}`}
                </code>
                
                <p className="text-muted-foreground mb-2">Incoming messages (from server):</p>
                <code className="block bg-muted p-3 rounded text-sm">
{`{
  "type": "message",
  "id": "msg-123",
  "content": "Hello back!",
  "fromId": "sender-user-id",
  "toId": "recipient-user-id",
  "timestamp": "2024-01-01T12:00:01Z",
  "delivered": true
}`}
                </code>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Backend Implementation Tips</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Parse JWT token from query parameters in your WebSocket handler</li>
                  <li>Send recent/undelivered messages when a user connects</li>
                  <li>Include message IDs and delivery status in responses</li>
                  <li>Handle connection cleanup when users disconnect</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};