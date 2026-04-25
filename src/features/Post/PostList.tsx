import { MessageCircle } from "lucide-react";
import type { Post } from "@/types";
import { PostDetails } from "./PostDetails";
import { useAppSelector } from "@/store/hooks";

interface PostsListProps {
  posts: Post[];
  headerTitle: string;
  onLikeClick?: (postId: string) => void;
  onDeletePost?: (postId: string) => void | Promise<void>;
  onStartConversation?: (targetUserId: string) => void | Promise<void>;
}

export function PostsList({
  posts,
  headerTitle,
  onLikeClick,
  onDeletePost,
  onStartConversation,
}: PostsListProps) {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

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
            isLikedByCurrentUser={currentUserId ? post.likes.includes(currentUserId) : false}
            isEditable={post.createdBy.id === currentUserId}
            onLikeClick={onLikeClick}
            onDeletePost={onDeletePost}
            onStartConversation={onStartConversation}
          />
        ))}
      </div>
    </div>
  );
}
