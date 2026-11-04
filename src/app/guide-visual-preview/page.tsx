import TeamGuide from "../../views/TeamGuide";
import { PageEmblem } from "../../components/shared/PageIdentity";

export default function GuideVisualPreview() {
  return (
    <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-12">
      <PageEmblem />
      <div className="page-container relative z-10">
        <TeamGuide />
      </div>
    </main>
  );
}
