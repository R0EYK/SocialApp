import { PostDetails } from "@/features/Post/PostDetails";
import {
  useCreateConversationMutation,
  useCreateCommentMutation,
  useDeletePostMutation,
  useGetPostByIdQuery,
  useTogglePostLikeMutation,
  useUpdateCommentMutation,
} from "@/store/api";
import { useAppSelector } from "@/store/hooks";
import { useNavigate, useParams } from "react-router-dom";

const Post = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useGetPostByIdQuery(postId ?? "", { skip: !postId });
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [toggleLike] = useTogglePostLikeMutation();
  const [deletePost] = useDeletePostMutation();
  const [createConversation] = useCreateConversationMutation();

  const handleAddComment = async (content: string, currentPostId: string) => {
    await createComment({ postId: currentPostId, content }).unwrap();
  };

  const handleLike = async (currentPostId: string) => {
    await toggleLike(currentPostId).unwrap();
  };

  const handleEditComment = async (
    commentId: string,
    content: string,
    currentPostId: string,
  ) => {
    await updateComment({ postId: currentPostId, commentId, content }).unwrap();
  };

  const handleDeletePost = async (currentPostId: string) => {
    if (!window.confirm("Delete this post?")) {
      return;
    }
    await deletePost(currentPostId).unwrap();
    navigate("/post/list", { replace: true });
  };

  const handleStartConversation = async (targetUserId: string) => {
    if (!currentUserId || currentUserId === targetUserId) {
      return;
    }
    const response = await createConversation({
      participantIds: [targetUserId],
    }).unwrap();
    navigate(`/chat/${response.conversationId}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading post...</p>
        ) : isError || !post ? (
          <p className="text-sm text-red-600">
            {typeof error === "object" &&
            error !== null &&
            "data" in error &&
            typeof error.data === "object" &&
            error.data !== null &&
            "message" in error.data &&
            typeof error.data.message === "string"
              ? error.data.message
              : "Failed to load post"}
          </p>
        ) : (
          <PostDetails
            post={post}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            currentUserId={currentUserId}
            onLikeClick={handleLike}
            onDeletePost={handleDeletePost}
            onStartConversation={handleStartConversation}
            isLikedByCurrentUser={
              currentUserId ? post.likes.includes(currentUserId) : false
            }
            isEditable={post.createdBy.id === currentUserId}
            shouldShowComments
          />
        )}
      </div>
    </main>
  );
};

export default Post;
