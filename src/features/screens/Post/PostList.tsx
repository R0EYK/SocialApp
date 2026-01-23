import { mockPosts } from "@/app.const";
import { PostsList } from "@/features/Post/PostList";

const PostList = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 mt-8">
        <PostsList posts={mockPosts} headerTitle="Posts" />
      </div>
    </main>
  );
};

export default PostList;
