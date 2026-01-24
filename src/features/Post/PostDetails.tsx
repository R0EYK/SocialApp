import React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import type { Post, Comment } from "@/types";
import { Link } from "react-router-dom";

interface PostDetailProps {
  post: Post;
  onAddComment?: (content: string, postId: string) => void;
}

export function PostDetails({ post, onAddComment }: PostDetailProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim(), post.id);
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="space-y-4">
      <Link
        to="/post/list"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span className="text-sm font-medium">Back to posts</span>
      </Link>

      <Card className="overflow-hidden">
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
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="size-5" />
            <span className="text-sm font-medium">
              {post.comments?.length ?? post.commentsCount} Comments
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Add Comment Section */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-foreground">
            Add a comment
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-24 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Press Ctrl+Enter to submit
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting || !onAddComment}
              size="sm"
            >
              <Send className="size-4 mr-2" />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      {post.comments && post.comments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-foreground">Comments</h3>
          </CardHeader>
          <CardContent className="space-y-0">
            {post.comments.map((comment, index) => (
              <div key={comment.id}>
                {index > 0 && <Separator className="my-4" />}
                <CommentItem
                  comment={comment}
                  formatDate={formatDate}
                  getInitials={getInitials}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty Comments State */}
      {(!post.comments || post.comments.length === 0) && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="size-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <MessageCircle className="size-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No comments yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Be the first to share your thoughts!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  formatDate: (dateString: string) => string;
  getInitials: (fullName: string) => string;
}

function CommentItem({ comment, formatDate, getInitials }: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="size-8 flex-shrink-0">
        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
          {getInitials(comment.createdBy.fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">
            {comment.createdBy.fullName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
