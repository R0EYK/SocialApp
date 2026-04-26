import React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Heart,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import type { Post, Comment } from "@/types";
import { Link } from "react-router-dom";
import { getInitials } from "@/lib/utils";

interface PostDetailProps {
  post: Post;
  currentUserId?: string;
  shouldShowComments?: boolean;
  onAddComment?: (content: string, postId: string) => void;
  onUpdateComment?: (
    commentId: string,
    postId: string,
    content: string,
  ) => void | Promise<void>;
  onLikeClick?: (postId: string) => void;
  onStartConversation?: (targetUserId: string) => void | Promise<void>;
  onDeletePost?: (postId: string) => void | Promise<void>;
  isLikedByCurrentUser?: boolean;
  isEditable?: boolean;
}

export function PostDetails({
  post,
  currentUserId,
  onAddComment,
  onUpdateComment,
  shouldShowComments = false,
  isLikedByCurrentUser = false,
  isEditable = false,
  onLikeClick,
  onStartConversation,
  onDeletePost,
}: PostDetailProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {shouldShowComments && (
        <Link
          to="/post/list"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm font-medium">Back to posts</span>
        </Link>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-3 pb-3 justify-between">
          <span>
            <Avatar className="size-10">
              <AvatarImage
                src={post.createdBy.image}
                alt={post.createdBy.fullName}
              />
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
          </span>
          {isEditable && (
            <div className="flex items-center gap-2">
              <Link
                to={`/post/edit/${post.id}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="size-5" />
                <span className="sr-only">Edit post</span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDeletePost?.(post.id)}
                disabled={!onDeletePost}
              >
                <Trash2 className="size-5" />
                <span className="sr-only">Delete post</span>
              </Button>
            </div>
          )}
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
        <CardFooter className="border-t border-border pt-3 flex flex-start gap-2">
          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <MessageCircle className="size-5" />
            <span className="text-sm font-medium">
              {post.comments?.length ?? post.commentsCount} Comments
            </span>
          </Link>
          <Button
            onClick={() => onLikeClick?.(post.id)}
            className="text-sm font-medium flex items-center gap-2 text-muted-foreground"
            variant="ghost"
          >
            <Heart
              className={`size-5 ${isLikedByCurrentUser ? "fill-red-500 text-red-500" : ""}`}
            />
            {post.likesCount} {post.likesCount === 1 ? "Like" : "Likes"}
          </Button>
          {!isEditable ? (
            <Button
              type="button"
              variant="ghost"
              className="ml-auto text-sm font-medium flex items-center gap-2 text-muted-foreground"
              onClick={() => onStartConversation?.(post.createdBy.id)}
              disabled={!onStartConversation}
            >
              <MessageCircle className="size-5" />
              Message
            </Button>
          ) : null}
        </CardFooter>
      </Card>
      {shouldShowComments && (
        <>
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
                <h3 className="text-lg font-semibold text-foreground">
                  Comments
                </h3>
              </CardHeader>
              <CardContent className="space-y-0">
                {post.comments.map((comment, index) => (
                  <div key={comment.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <CommentItem
                      comment={comment}
                      postId={post.id}
                      formatDate={formatDate}
                      canEdit={Boolean(currentUserId && comment.createdBy.id === currentUserId)}
                      onUpdateComment={onUpdateComment}
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
        </>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  formatDate: (dateString: string) => string;
  canEdit: boolean;
  onUpdateComment?: (
    commentId: string,
    postId: string,
    content: string,
  ) => void | Promise<void>;
}

function CommentItem({
  comment,
  postId,
  formatDate,
  canEdit,
  onUpdateComment,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdateComment || !editedContent.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateComment(comment.id, postId, editedContent.trim());
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 flex-shrink-0">
        <AvatarImage
          src={comment.createdBy.image}
          alt={comment.createdBy.fullName}
        />
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
          {canEdit && !isEditing ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 ml-auto text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3.5" />
              <span className="sr-only">Edit comment</span>
            </Button>
          ) : null}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-20 resize-none"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !editedContent.trim()}
              >
                <Check className="size-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleCancel}>
                <X className="size-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground leading-relaxed">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}
