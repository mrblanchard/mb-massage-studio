import { ChangePasswordForm } from "./change-password-form";

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-muted-foreground">Update your password.</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
