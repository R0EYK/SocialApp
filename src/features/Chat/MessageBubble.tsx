import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex flex-col max-w-[75%] gap-1",
        isOwn ? "self-end items-end" : "self-start items-start",
      )}
    >
      <div
        className={cn(
          "px-4 py-2 rounded-2xl",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md",
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
      <span className="text-xs text-muted-foreground px-1">
        {format(new Date(message.createdAt), "HH:mm")}
      </span>
    </div>
  );
}
