import { ProfileHeader } from "./ProfileHeader";
import { PostsList } from "@/features/Post/PostList";
import {
  useDeletePostMutation,
  useGetPostsByUserIdQuery,
  useGetMeQuery,
  useTogglePostLikeMutation,
  useUpdateMeMutation,
} from "@/store/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/reducers/auth";

export default function Profile() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const { data: me, isLoading: isProfileLoading, error: profileError } = useGetMeQuery();
  const { data: myPostsData, isLoading: arePostsLoading } = useGetPostsByUserIdQuery(
    { userId: currentUserId ?? "", limit: 20, skip: 0 },
    { skip: !currentUserId },
  );
  const [updateMe, { isLoading: isUpdatingProfile }] = useUpdateMeMutation();
  const [toggleLike] = useTogglePostLikeMutation();
  const [deletePost] = useDeletePostMutation();

  const updateLocalUser = (updatedUser: typeof me) => {
    if (!updatedUser) return;
    dispatch(setUser(updatedUser));
  };

  const handleSaveName = async (nextName: string) => {
    const updatedUser = await updateMe({ fullName: nextName }).unwrap();
    updateLocalUser(updatedUser);
  };

  const handleSaveAvatar = async (file: File) => {
    const updatedUser = await updateMe({ image: file }).unwrap();
    updateLocalUser(updatedUser);
  };

  const handleLike = async (postId: string) => {
    await toggleLike(postId).unwrap();
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post?")) {
      return;
    }
    await deletePost(postId).unwrap();
  };

  const profileErrorMessage =
    typeof profileError === "object" &&
    profileError !== null &&
    "data" in profileError &&
    typeof profileError.data === "object" &&
    profileError.data !== null &&
    "message" in profileError.data &&
    typeof profileError.data.message === "string"
      ? profileError.data.message
      : "Failed to load profile";

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {isProfileLoading || !me ? (
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        ) : (
          <ProfileHeader
            name={me.fullName}
            avatar={me.image}
            isUpdating={isUpdatingProfile}
            onSaveName={handleSaveName}
            onSaveAvatar={handleSaveAvatar}
          />
        )}
        {profileError ? (
          <p className="mt-4 text-sm text-red-600">{profileErrorMessage}</p>
        ) : null}
        <div className="mt-8">
          {arePostsLoading ? (
            <p className="text-sm text-muted-foreground">Loading your posts...</p>
          ) : (
            <PostsList
              posts={myPostsData?.items ?? []}
              headerTitle="Your Posts"
              onLikeClick={handleLike}
              onDeletePost={handleDeletePost}
            />
          )}
        </div>
      </div>
    </main>
  );
}
