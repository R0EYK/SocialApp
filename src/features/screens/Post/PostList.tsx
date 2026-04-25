import { PostsList } from "@/features/Post/PostList";
import {
  useCreateConversationMutation,
  useDeletePostMutation,
  useGetPostsQuery,
  useTogglePostLikeMutation,
} from "@/store/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

const PostList = () => {
  const navigate = useNavigate();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const [pageLimit, setPageLimit] = useState(10);
  const { data, isLoading, isError, error, isFetching } = useGetPostsQuery({
    limit: pageLimit,
    skip: 0,
  });
  const [toggleLike, { isLoading: isLiking }] = useTogglePostLikeMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [createConversation] = useCreateConversationMutation();

  const posts = data?.items ?? [];

  const handleLike = async (postId: string) => {
    await toggleLike(postId).unwrap();
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post?")) {
      return;
    }
    await deletePost(postId).unwrap();
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
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 mt-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading posts...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">
            {typeof error === "object" &&
            error !== null &&
            "data" in error &&
            typeof error.data === "object" &&
            error.data !== null &&
            "message" in error.data &&
            typeof error.data.message === "string"
              ? error.data.message
              : "Failed to load posts"}
          </p>
        ) : (
          <>
            <PostsList
              posts={posts}
              headerTitle="Posts"
              onLikeClick={handleLike}
              onDeletePost={handleDeletePost}
              onStartConversation={handleStartConversation}
            />
            <div className="mt-4 flex items-center justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={!data?.hasMore || isFetching || isLiking || isDeleting}
                onClick={() => setPageLimit((previous) => previous + 10)}
              >
                {isFetching ? "Loading..." : data?.hasMore ? "Load more" : "No more posts"}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default PostList;
