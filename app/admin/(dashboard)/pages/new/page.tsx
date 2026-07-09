import { PageForm } from "../page-form";

export default function NewPagePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New page</h1>
      </div>
      <PageForm page={null} />
    </div>
  );
}
