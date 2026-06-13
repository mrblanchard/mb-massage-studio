import { SocialComposer } from "../social-composer";

export default function NewSocialPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      </div>
      <SocialComposer post={null} />
    </div>
  );
}
