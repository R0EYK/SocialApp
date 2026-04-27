import { useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Message, User } from "@/types";
import { Link, useParams } from "react-router-dom";
import { getInitials, resolveMediaUrl } from "@/lib/utils";
import { MessageBubble } from "@/features/Chat/MessageBubble";
import { MessageInput } from "@/features/Chat/MessageInput";
import {
  api,
  useGetConversationByIdQuery,
} from "@/store/api";
import { getSocket } from "@/lib/socket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useState } from "react";

function getOtherParticipant(
  participants: User[],
  currentUserId: string,
): User {
  return participants.find((p) => p.id !== currentUserId) || participants[0];
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? "");
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");

  const { data: conversation, isLoading, isError, error } = useGetConversationByIdQuery(
    conversationId,
    { skip: !conversationId },
  );
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

  useEffect(() => {
    if (!accessToken || !conversationId) {
      return;
    }

    const socket = getSocket(accessToken);
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("user:online");
    const ensureJoinedConversationRoom = () => {
      socket.emit("conversation:join", { conversationId }, () => {});
    };
    ensureJoinedConversationRoom();
    socket.on("connect", ensureJoinedConversationRoom);

    const onMessageReceived = (payload: {
      messageId: string;
      conversationId: string;
      senderId: string;
      sender?: User;
      content: string;
      createdAt: string;
    }) => {
      if (payload.conversationId !== conversationId) {
        return;
      }

      dispatch(
        api.util.updateQueryData("getConversationById", conversationId, (draft) => {
          const exists = draft.messages.some((message) => message.id === payload.messageId);
          if (exists) return;
          draft.messages.push({
            id: payload.messageId,
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            sender: payload.sender,
            content: payload.content,
            createdAt: payload.createdAt,
          });
          draft.totalMessages = (draft.totalMessages ?? draft.messages.length) + 1;
          draft.updatedAt = payload.createdAt;
        }),
      );

      dispatch(
        api.util.updateQueryData("getConversations", undefined, (draft) => {
          const targetConversation = draft.conversations.find(
            (conversation) => conversation.id === payload.conversationId,
          );
          if (!targetConversation) return;
          targetConversation.lastMessage = {
            id: payload.messageId,
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            sender: payload.sender,
            content: payload.content,
            createdAt: payload.createdAt,
          };
          targetConversation.updatedAt = payload.createdAt;
        }),
      );
    };

    const onMessageUpdated = (payload: {
      messageId: string;
      conversationId: string;
      content: string;
      updatedAt: string;
    }) => {
      if (payload.conversationId !== conversationId) {
        return;
      }
      dispatch(
        api.util.updateQueryData("getConversationById", conversationId, (draft) => {
          const targetMessage = draft.messages.find(
            (message) => message.id === payload.messageId,
          );
          if (!targetMessage) return;
          targetMessage.content = payload.content;
          targetMessage.updatedAt = payload.updatedAt;
        }),
      );
      dispatch(
        api.util.updateQueryData("getConversations", undefined, (draft) => {
          const targetConversation = draft.conversations.find(
            (conversation) => conversation.id === payload.conversationId,
          );
          if (!targetConversation?.lastMessage) return;
          if (targetConversation.lastMessage.id !== payload.messageId) return;
          targetConversation.lastMessage.content = payload.content;
          targetConversation.lastMessage.updatedAt = payload.updatedAt;
          targetConversation.updatedAt = payload.updatedAt;
        }),
      );
    };

    const onMessageDeleted = (payload: {
      messageId: string;
      conversationId: string;
    }) => {
      if (payload.conversationId !== conversationId) {
        return;
      }
      dispatch(
        api.util.updateQueryData("getConversationById", conversationId, (draft) => {
          draft.messages = draft.messages.filter(
            (message) => message.id !== payload.messageId,
          );
          draft.totalMessages = Math.max(0, (draft.totalMessages ?? 1) - 1);
        }),
      );
      dispatch(
        api.util.updateQueryData("getConversations", undefined, (draft) => {
          const targetConversation = draft.conversations.find(
            (conversation) => conversation.id === payload.conversationId,
          );
          if (!targetConversation?.lastMessage) return;
          if (targetConversation.lastMessage.id !== payload.messageId) return;
          targetConversation.lastMessage = undefined;
        }),
      );
    };

    const onUserTyping = (payload: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) => {
      if (payload.conversationId !== conversationId) return;
      if (payload.userId === currentUserId) return;
      setTypingUserId(payload.isTyping ? payload.userId : null);
    };

    socket.on("message:received", onMessageReceived);
    socket.on("message:updated", onMessageUpdated);
    socket.on("message:deleted", onMessageDeleted);
    socket.on("user:typing", onUserTyping);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("connect", ensureJoinedConversationRoom);
      socket.off("message:received", onMessageReceived);
      socket.off("message:updated", onMessageUpdated);
      socket.off("message:deleted", onMessageDeleted);
      socket.off("user:typing", onUserTyping);
    };
  }, [accessToken, conversationId, currentUserId, dispatch]);

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

  const handleSendMessage = (content: string) => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);
    socket.emit(
      "message:send",
      { conversationId, content },
      (response: { success: boolean; error?: string }) => {
        if (!response.success && response.error) {
          window.alert(response.error);
        }
      },
    );
    socket.emit("user:typing", { conversationId, isTyping: false });
  };

  const handleStartEditMessage = (messageId: string) => {
    const existing = messages.find((message) => message.id === messageId);
    if (!existing) return;
    setEditingMessageId(messageId);
    setEditingDraft(existing.content);
  };

  const handleCancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingDraft("");
  };

  const handleSaveEditMessage = () => {
    if (!accessToken || !editingMessageId) return;
    const nextContent = editingDraft.trim();
    if (!nextContent) return;
    const existing = messages.find((message) => message.id === editingMessageId);
    if (!existing || existing.content === nextContent) {
      handleCancelEditMessage();
      return;
    }

    const socket = getSocket(accessToken);
    socket.emit("message:edit", {
      messageId: editingMessageId,
      content: nextContent,
      conversationId,
    }, (response: { success: boolean; error?: string }) => {
      if (!response.success && response.error) {
        window.alert(response.error);
        return;
      }
      handleCancelEditMessage();
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!accessToken) return;
    if (!window.confirm("Delete this message?")) return;
    const socket = getSocket(accessToken);
    socket.emit("message:delete", {
      messageId,
      conversationId,
    }, (response: { success: boolean; error?: string }) => {
      if (!response.success && response.error) {
        window.alert(response.error);
      }
    });
  };

  const handleTypingChange = (isTyping: boolean) => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);
    socket.emit("user:typing", { conversationId, isTyping });
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
            src={resolveMediaUrl(otherParticipant.image) || "/placeholder.svg"}
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
          {typingUserId ? (
            <p className="text-xs text-muted-foreground">Typing...</p>
          ) : null}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              onEditStart={
                message.senderId === currentUserId
                  ? () => handleStartEditMessage(message.id)
                  : undefined
              }
              onDelete={
                message.senderId === currentUserId
                  ? () => handleDeleteMessage(message.id)
                  : undefined
              }
              isEditing={editingMessageId === message.id}
              editValue={editingDraft}
              onEditValueChange={setEditingDraft}
              onEditCancel={handleCancelEditMessage}
              onEditSave={handleSaveEditMessage}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <MessageInput
        onSend={handleSendMessage}
        onTypingChange={handleTypingChange}
      />
    </div>
  );
}
