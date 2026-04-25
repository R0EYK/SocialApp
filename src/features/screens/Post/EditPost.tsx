import { PostForm } from "@/features/Form/PostForm";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetPostByIdQuery, useUpdatePostMutation } from "@/store/api";

export default function EditPostPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { data: post, isLoading } = useGetPostByIdQuery(postId ?? "", {
    skip: !postId,
  });
  const [updatePost] = useUpdatePostMutation();

  const handleSubmit = async (data: {
    content: string;
    image?: File | null;
    removeImage?: boolean;
  }) => {
    if (!postId) return;
    await updatePost({ postId, data }).unwrap();
    navigate(`/post/${postId}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Link
          to={`/post/${postId}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm font-medium">Back to post</span>
        </Link>

        {isLoading || !post ? (
          <p className="text-sm text-muted-foreground">Loading post...</p>
        ) : (
          <PostForm
            mode="edit"
            initialData={post}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </main>
  );
}
