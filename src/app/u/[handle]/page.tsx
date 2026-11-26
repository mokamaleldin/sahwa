import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import { platformStore } from "../../../../server/platform/store.js";
import { describeAssignment } from "../../../../server/platform/service.js";
import { PageEmblem } from "../../../components/shared/PageIdentity";

export const dynamic = "force-dynamic";
// Not indexed until an indexing policy is approved.
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props { params: Promise<{ handle: string }> }

export default async function PublicProfile({ params }: Props) {
  const { handle } = await params;
  if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(handle)) notFound();
  // Separate, limited query: only published, real, active profiles.
  const profile = await platformStore.publicProfile(handle).catch(() => null);
  if (!profile) notFound();
  const fields = new Set<string>(profile.publicFields || []);
  const roles = fields.has("roles") ? (await platformStore.assignmentsOf(profile.volunteerId)).map(describeAssignment) : [];
  const links = fields.has("links") ? (profile.links || []) as { label: string; url: string }[] : [];
  return (
    <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-12">
      <PageEmblem />
      <div className="page-container relative z-10">
        <article className="platform-card personal-public-profile mx-auto">
          <div className="personal-profile-hero">
            <span className="team-avatar team-avatar-large"><UserRound size={34} aria-hidden="true" /></span>
            <div>
              <h1 className="font-heading text-2xl text-[#752026]">{profile.displayName || profile.fullName}</h1>
              {fields.has("work") && profile.work && <p className="personal-profile-headline">{profile.work}</p>}
              {fields.has("roles") && roles.length > 0 && <p className="platform-muted">{roles.map((r: {title:string})=>r.title).join("، ")} · صحوة</p>}
            </div>
          </div>
          {fields.has("bio") && profile.bio && <p className="mb-3">{profile.bio}</p>}
          <dl className="personal-profile-details">
            {fields.has("university") && profile.university && <div><dt className="platform-muted">الجامعة</dt><dd>{profile.university}</dd></div>}
            {fields.has("major") && profile.major && <div><dt className="platform-muted">التخصص</dt><dd>{profile.major}</dd></div>}
            {fields.has("work") && profile.work && <div><dt className="platform-muted">العمل أو المجال المهني</dt><dd>{profile.work}</dd></div>}
            {fields.has("skills") && profile.skills && <div><dt className="platform-muted">المهارات والاهتمامات</dt><dd>{profile.skills}</dd></div>}
            {fields.has("participation") && profile.participation && <div><dt className="platform-muted">مشاركتي في صحوة</dt><dd>{profile.participation}</dd></div>}
            {roles.length > 0 && <div><dt className="platform-muted">الصفة في صحوة</dt><dd>{roles.map((r: { title: string }) => r.title).join("، ")}</dd></div>}
          </dl>
          {links.length > 0 && (
            <section className="mt-5"><h2 className="font-heading">روابطي وأعمالي</h2><div className="personal-profile-links">
              {links.map((l, i) => <a key={i} className="platform-chip" href={l.url} target="_blank" rel="noopener noreferrer nofollow">{l.label || new URL(l.url).hostname}</a>)}
            </div></section>
          )}
        </article>
      </div>
    </main>
  );
}
