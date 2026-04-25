import { useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Message, User } from "@/types";
import { Link, useParams } from "react-router-dom";
import { getInitials } from "@/lib/utils";
import { MessageBubble } from "@/features/Chat/MessageBubble";
import { MessageInput } from "@/features/Chat/MessageInput";
import {
  useDeleteMessageMutation,
  useEditMessageMutation,
  useGetConversationByIdQuery,
} from "@/store/api";
import { useAppSelector } from "@/store/hooks";

function getOtherParticipant(
  participants: User[],
  currentUserId: string,
): User {
  return participants.find((p) => p.id !== currentUserId) || participants[0];
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? "");

  const { data: conversation, isLoading, isError, error } = useGetConversationByIdQuery(
    conversationId,
    { skip: !conversationId },
  );
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages: Message[] = useMemo(
    () => conversation?.messages ?? [],
    [conversation?.messages],
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading conversation...</div>;
  }
  if (isError || !conversation) {
    const errorMessage =
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data &&
      typeof error.data.message === "string"
        ? error.data.message
        : "Conversation not found.";
    return <div className="p-4 text-sm text-red-600">{errorMessage}</div>;
  }

  const otherParticipant = getOtherParticipant(conversation.participants, currentUserId);

  const handleSendMessage = () => {
    // Backend currently has no REST endpoint for creating messages.
    // Sending is added in stage 5 with Socket.io.
  };

  const handleEditMessage = async (messageId: string) => {
    const existing = messages.find((message) => message.id === messageId);
    if (!existing) return;
    const nextContent = window.prompt("Edit message", existing.content);
    if (!nextContent || nextContent.trim() === existing.content) return;
    await editMessage({
      messageId,
      content: nextContent.trim(),
      conversationId,
    }).unwrap();
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Delete this message?")) return;
    await deleteMessage({ messageId, conversationId }).unwrap();
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
              isOwn={message.senderId === currentUserId}
              onEdit={
                message.senderId === currentUserId
                  ? () => handleEditMessage(message.id)
                  : undefined
              }
              onDelete={
                message.senderId === currentUserId
                  ? () => handleDeleteMessage(message.id)
                  : undefined
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <MessageInput
        onSend={handleSendMessage}
        disabled
        disabledReason="Sending messages will be enabled in realtime stage."
      />
    </div>
  );
}
