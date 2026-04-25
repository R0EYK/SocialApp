import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MessageBubble({
  message,
  isOwn,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
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
      {isOwn ? (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onEdit}
            disabled={!onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={!onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
