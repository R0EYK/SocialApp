import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { Conversation, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
}

function getOtherParticipant(
  participants: User[],
  currentUserId: string,
): User {
  return participants.find((p) => p.id !== currentUserId) || participants[0];
}

export function ConversationItem({
  conversation,
  currentUserId,
}: ConversationItemProps) {
  const otherParticipant = getOtherParticipant(
    conversation.participants,
    currentUserId,
  );
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <Link
      to={`/chat/${conversation.id}`}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={otherParticipant.image || "/placeholder.svg"}
          alt={otherParticipant.fullName}
        />
        <AvatarFallback>
          {getInitials(otherParticipant.fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-foreground truncate">
            {otherParticipant.fullName}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(conversation.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        {lastMessage && (
          <p className="text-sm text-muted-foreground truncate mt-1">
            {lastMessage.senderId === currentUserId ? "You: " : ""}
            {lastMessage.content}
          </p>
        )}
      </div>
    </Link>
  );
}
