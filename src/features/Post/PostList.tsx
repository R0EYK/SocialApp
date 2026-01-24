import { MessageCircle } from "lucide-react";
import type { Post } from "@/types";
import { PostDetails } from "./PostDetails";

interface PostsListProps {
  posts: Post[];
  headerTitle: string;
}

export function PostsList({ posts, headerTitle }: PostsListProps) {
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
          <PostDetails
            key={post.id}
            post={post}
            shouldShowComments={false}
            isLikedByCurrentUser={true}
          />
        ))}
      </div>
    </div>
  );
}
