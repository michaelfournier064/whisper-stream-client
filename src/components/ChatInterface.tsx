import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Clock } from 'lucide-react';
import { Message } from '@/types/chat';

interface ChatInterfaceProps {
  messages: Message[];
  currentUserId: string;
  recipientId: string;
  isConnected: boolean;
  onSendMessage: (content: string, toId: string) => void;
}

export const ChatInterface = ({ 
  messages, 
  currentUserId, 
  recipientId, 
  isConnected, 
  onSendMessage 
}: ChatInterfaceProps) => {
  const [messageInput, setMessageInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !isConnected) return;
    
    onSendMessage(messageInput.trim(), recipientId);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with {recipientId}
          </CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {messages.length} messages
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 px-4 py-2"
        >
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.fromId === currentUserId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                        isCurrentUser
                          ? 'bg-chat-bubble-sent text-chat-bubble-sent-foreground'
                          : 'bg-chat-bubble-received text-chat-bubble-received-foreground border'
                      }`}
                      style={{
                        boxShadow: 'var(--shadow-message)'
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs opacity-70 font-medium">
                          {isCurrentUser ? 'You' : message.fromId}
                        </span>
                        <div className="flex items-center gap-1">
                          {!message.delivered && isCurrentUser && (
                            <Clock className="h-3 w-3 opacity-50" />
                          )}
                          <span className="text-xs opacity-50">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-chat-input">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type your message..." : "Connect to start chatting"}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || !isConnected}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
};