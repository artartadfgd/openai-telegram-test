import { CuratedTrainingView } from "@/components/curated-training-view";

export default async function LibraryTemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <CuratedTrainingView slug={slug} />
    </div>
  );
}
