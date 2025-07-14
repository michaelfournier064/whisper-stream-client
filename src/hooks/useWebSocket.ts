import { useState, useEffect, useRef } from 'react';
import { Message, ConnectionConfig, ChatState } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

export const useWebSocket = () => {
  const [state, setState] = useState<ChatState>({
    isConnected: false,
    isConnecting: false,
    messages: [],
    error: null
  });

  const websocketRef = useRef<WebSocket | null>(null);
  const configRef = useRef<ConnectionConfig | null>(null);
  const { toast } = useToast();

  const connect = (config: ConnectionConfig) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      disconnect();
    }

    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      error: null,
      messages: [] 
    }));

    configRef.current = config;

    try {
      // Since WebSocket API doesn't support custom headers, we'll use query parameters
      // This is a common workaround for JWT authentication in WebSocket connections
      const wsUrl = `${config.serverUrl}?token=${encodeURIComponent(config.jwtToken)}&userId=${encodeURIComponent(config.userId)}`;
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          isConnecting: false,
          error: null 
        }));
        
        toast({
          title: "Connected",
          description: "Successfully connected to chat server",
        });

        // Request recent/undelivered messages
        ws.send(JSON.stringify({
          type: 'get_recent_messages',
          userId: config.userId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'message') {
            const message: Message = {
              id: data.id || Date.now().toString(),
              content: data.content,
              fromId: data.fromId,
              toId: data.toId,
              timestamp: data.timestamp || new Date().toISOString(),
              delivered: data.delivered || false
            };

            setState(prev => ({
              ...prev,
              messages: [...prev.messages, message]
            }));
          } else if (data.type === 'recent_messages' && Array.isArray(data.messages)) {
            const messages: Message[] = data.messages.map((msg: any) => ({
              id: msg.id || Date.now().toString(),
              content: msg.content,
              fromId: msg.fromId,
              toId: msg.toId,
              timestamp: msg.timestamp || new Date().toISOString(),
              delivered: msg.delivered || false
            }));

            setState(prev => ({
              ...prev,
              messages: messages
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Connection error occurred',
          isConnecting: false 
        }));
        
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat server",
          variant: "destructive",
        });
      };

      ws.onclose = (event) => {
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isConnecting: false,
          error: event.code !== 1000 ? `Connection closed: ${event.reason || 'Unknown reason'}` : null
        }));

        if (event.code !== 1000) {
          toast({
            title: "Disconnected",
            description: `Connection lost: ${event.reason || 'Unknown reason'}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Disconnected",
            description: "Successfully disconnected from chat server",
          });
        }
      };

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create WebSocket connection',
        isConnecting: false 
      }));
      
      toast({
        title: "Connection Failed",
        description: "Unable to create WebSocket connection",
        variant: "destructive",
      });
    }
  };

  const sendMessage = (content: string, toId: string) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not Connected",
        description: "Please connect to the server first",
        variant: "destructive",
      });
      return;
    }

    if (!configRef.current) {
      toast({
        title: "Configuration Missing",
        description: "Connection configuration is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      const message = {
        type: 'message',
        content,
        toId,
        fromId: configRef.current.userId,
        timestamp: new Date().toISOString()
      };

      websocketRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    if (websocketRef.current) {
      websocketRef.current.close(1000, 'Manual disconnect');
      websocketRef.current = null;
    }
    configRef.current = null;
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    state,
    connect,
    disconnect,
    sendMessage
  };
};