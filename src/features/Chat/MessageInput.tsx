import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  disabledReason?: string;
  onTypingChange?: (isTyping: boolean) => void;
}

export function MessageInput({
  onSend,
  disabled,
  disabledReason,
  onTypingChange,
}: MessageInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleBlur = () => {
    onTypingChange?.(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-4 border-t border-border bg-background"
    >
      <Textarea
        value={content}
        onChange={(e) => {
          const value = e.target.value;
          setContent(value);
          onTypingChange?.(value.trim().length > 0);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Type a message..."
        className="min-h-[44px] max-h-32 resize-none"
        rows={1}
        disabled={disabled}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!content.trim() || disabled}
        className="shrink-0 h-11 w-11"
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>
      {disabled && disabledReason ? (
        <p className="text-xs text-muted-foreground">{disabledReason}</p>
      ) : null}
    </form>
  );
}
