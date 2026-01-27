import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Message, User } from "@/types";
import { Link, useParams } from "react-router-dom";
import { currentUser, mockConversations } from "@/app.const";
import { getInitials } from "@/lib/utils";
import { MessageBubble } from "@/features/Chat/MessageBubble";
import { MessageInput } from "@/features/Chat/MessageInput";

function getOtherParticipant(
  participants: User[],
  currentUserId: string,
): User {
  return participants.find((p) => p.id !== currentUserId) || participants[0];
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const conversation = mockConversations.find((c) => c.id === conversationId);

  const [messages, setMessages] = useState<Message[]>(
    conversation?.messages || [],
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversation) return <div className="p-4">Conversation not found.</div>;

  const otherParticipant = getOtherParticipant(
    conversation.participants,
    currentUser.id,
  );

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-background">
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/chat">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to conversations</span>
          </Link>
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={otherParticipant.image || "/placeholder.svg"}
            alt={otherParticipant.fullName}
          />
          <AvatarFallback>
            {getInitials(otherParticipant.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="font-medium text-foreground truncate">
            {otherParticipant.fullName}
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUser.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
