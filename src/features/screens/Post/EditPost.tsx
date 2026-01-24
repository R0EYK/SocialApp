import { mockPosts } from "@/app.const";
import { PostForm } from "@/features/Form/PostForm";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function EditPostPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();

  const handleSubmit = async (data: { content: string; image?: string }) => {
    // TODO: Implement your API call to update the post
    console.log("Updating post:", postId, data);

    // After successful update, redirect to the post detail page
    navigate(`/post/${postId}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Link
          to={`/posts/${postId}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm font-medium">Back to post</span>
        </Link>

        <PostForm
          mode="edit"
          initialData={mockPosts[0]} // Replace with actual post data fetched by postId
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </main>
  );
}
