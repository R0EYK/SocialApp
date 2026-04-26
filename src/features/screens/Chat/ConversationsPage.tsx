import { ConversationItem } from "@/features/Chat/ConversationItem";
import { MessageSquare } from "lucide-react";
import { useGetConversationsQuery } from "@/store/api";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export default function ConversationsPage() {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const { data, isLoading, isError, error, refetch } = useGetConversationsQuery();
  const sortedConversations = [...(data?.conversations ?? [])].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const errorMessage =
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
      ? error.data.message
      : "Failed to load conversations.";

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);
    if (!socket.connected) {
      socket.connect();
    }

    const refreshConversations = () => {
      refetch();
    };

    socket.on("message:received", refreshConversations);
    socket.on("message:updated", refreshConversations);
    socket.on("message:deleted", refreshConversations);
    socket.on("conversation:created", refreshConversations);
    socket.on("conversation:userAdded", refreshConversations);
    socket.on("conversation:userRemoved", refreshConversations);

    return () => {
      socket.off("message:received", refreshConversations);
      socket.off("message:updated", refreshConversations);
      socket.off("message:deleted", refreshConversations);
      socket.off("conversation:created", refreshConversations);
      socket.off("conversation:userAdded", refreshConversations);
      socket.off("conversation:userRemoved", refreshConversations);
    };
  }, [accessToken, refetch]);

  useEffect(() => {
    if (!accessToken || !data?.conversations?.length) return;
    const socket = getSocket(accessToken);
    if (!socket.connected) {
      socket.connect();
    }

    const joinedConversationIds = data.conversations.map((conversation) => conversation.id);
    joinedConversationIds.forEach((id) => {
      socket.emit("conversation:join", { conversationId: id }, () => {});
    });

    return () => {
      joinedConversationIds.forEach((id) => {
        socket.emit("conversation:leave", { conversationId: id });
      });
    };
  }, [accessToken, data?.conversations]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-background">
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">Messages</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading conversations...</p>
        ) : isError ? (
          <p className="p-4 text-sm text-red-600">{errorMessage}</p>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-2">
              No conversations yet
            </h2>
            <p className="text-sm text-muted-foreground">
              Start a conversation with someone to see it here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId ?? ""}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
