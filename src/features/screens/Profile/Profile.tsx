import { mockPosts } from "@/app.const";
import { ProfileHeader } from "./ProfileHeader";
import { PostsList } from "@/features/Post/PostList";

export default function Profile() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <ProfileHeader
          initialName="Change This"
          initialAvatar="After Integration"
        />
        <div className="mt-8">
          <PostsList posts={mockPosts} headerTitle="Your Posts" />
        </div>
      </div>
    </main>
  );
}
