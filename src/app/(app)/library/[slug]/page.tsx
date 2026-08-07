import { notFound } from "next/navigation";
import { getLibraryTemplate } from "@/lib/library-templates";
import { CuratedTrainingView } from "@/components/curated-training-view";

export default async function LibraryTemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = getLibraryTemplate(slug);
  if (!template) notFound();

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <CuratedTrainingView template={template} />
    </div>
  );
}
