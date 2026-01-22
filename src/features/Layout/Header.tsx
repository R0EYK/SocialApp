import { PlusSquare, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { APP_NAME } from "@/app.const";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground"></span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            {APP_NAME}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/create" aria-label="Add post">
              <PlusSquare className="size-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link to="/chat" aria-label="Chat">
              <MessageCircle className="size-5" />
            </Link>
          </Button>

          <Link to="/profile" className="ml-2">
            <Avatar className="size-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/20 border-black border-2">
              <AvatarImage src="/avatar.jpg" alt="Profile" />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                JD
              </AvatarFallback>
            </Avatar>
          </Link>
        </nav>
      </div>
    </header>
  );
}
