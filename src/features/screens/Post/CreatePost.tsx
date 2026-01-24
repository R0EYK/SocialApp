import { PostForm } from "@/features/Form/PostForm";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AddPostPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: { content: string; image?: string }) => {
    console.log("Creating post:", data);

    navigate("/post/list");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Link
          to="/post/list"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm font-medium">Back to posts</span>
        </Link>

        <PostForm mode="add" onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </main>
  );
}
