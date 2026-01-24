import { mockPosts } from "@/app.const";
import { PostDetails } from "@/features/Post/PostDetails";

const Post = () => {
  const handleAddComment = (content: string, postId: string) => {
    console.log("New comment added to post", postId, ":", content);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <PostDetails post={mockPosts[0]} onAddComment={handleAddComment} />
      </div>
    </main>
  );
};

export default Post;
