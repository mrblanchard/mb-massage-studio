import { PostForm } from "../post-form";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      </div>
      <PostForm post={null} />
    </div>
  );
}
