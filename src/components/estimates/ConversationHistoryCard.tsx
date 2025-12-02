import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronDown, ChevronUp, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationHistoryCardProps {
  conversationHistory?: ConversationMessage[];
}

export function ConversationHistoryCard({ conversationHistory }: ConversationHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!conversationHistory || conversationHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            No conversation history available for this estimate.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayMessages = isExpanded ? conversationHistory : conversationHistory.slice(-4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversation History
        </CardTitle>
        {conversationHistory.length > 4 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All ({conversationHistory.length})
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {!isExpanded && conversationHistory.length > 4 && (
          <p className="text-xs text-muted-foreground text-center pb-2 border-b">
            Showing last 4 messages
          </p>
        )}
        {displayMessages.map((msg, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex gap-3 p-3 rounded-lg text-sm",
              msg.role === 'user' 
                ? "bg-primary/10 ml-4" 
                : "bg-muted/50 mr-4"
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
              msg.role === 'user' ? "bg-primary/20" : "bg-secondary"
            )}>
              {msg.role === 'user' ? (
                <User className="h-3 w-3 text-primary" />
              ) : (
                <Bot className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 whitespace-pre-wrap">
              {msg.content}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
