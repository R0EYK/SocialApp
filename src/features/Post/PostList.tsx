import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import type { Post } from "@/types";
import { Link } from "react-router-dom";

interface PostsListProps {
  posts: Post[];
  headerTitle: string;
}

export function PostsList({ posts, headerTitle }: PostsListProps) {
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <MessageCircle className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No posts yet
        </h3>
        <p className="text-muted-foreground">Your posts will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">{headerTitle}</h2>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Avatar className="size-10">
                <AvatarFallback className="text-sm bg-accent text-accent-foreground">
                  {getInitials(post.createdBy.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">
                  {post.createdBy.fullName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(post.createdAt)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-foreground leading-relaxed">{post.content}</p>
              {post.image && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Post image"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-border pt-3">
              <Link
                to={`/posts/${post.id}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
              >
                <MessageCircle className="size-5" />
                <span className="text-sm font-medium">
                  {post.commentsCount} Comments
                </span>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
