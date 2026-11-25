"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  ArrowUpLeft,
  BadgeCheck,
  BookOpen,
  Building2,
  GitBranch,
  Network,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import TeamDialog from "./TeamDialog";
import GuideBooklet from "./GuideBooklet";
import { GuideGovernanceBlocks } from "./GuideGovernance";
import {
  parseStructureBook,
  type StructureEntry,
} from "../../lib/structureParser";

const councilRoles = [
  "sahwa-lead",
  "women-sector-lead",
  "central-youth-lead",
  "central-women-lead",
  "central-media-lead",
  "central-relations-lead",
] as const;

type ViewMode = "map" | "book";

function EntryButton({
  entryId,
  entries,
  onSelect,
  compact = false,
  labelOverride,
}: {
  entryId: string;
  entries: Map<string, StructureEntry>;
  onSelect: (entry: StructureEntry) => void;
  compact?: boolean;
  labelOverride?: string;
}) {
  const entry = entries.get(entryId);
  if (!entry) return null;
  return (
    <button
      type="button"
      className={`guide-role-button${compact ? " guide-role-button-compact" : ""}`}
      onClick={() => onSelect(entry)}
      data-role-id={entry.id}
    >
      <span>{labelOverride || entry.title}</span>
      <ArrowUpLeft size={15} aria-hidden="true" />
    </button>
  );
}

function UnitCardButton({
  unitId,
  entries,
  onSelect,
  small = false,
}: {
  unitId: string;
  entries: Map<string, StructureEntry>;
  onSelect: (entry: StructureEntry) => void;
  small?: boolean;
}) {
  const entry = entries.get(unitId);
  if (!entry) return null;
  return (
    <button
      type="button"
      className={small ? "guide-map-unit-trigger guide-map-unit-trigger-small" : "guide-map-unit-trigger"}
      onClick={() => onSelect(entry)}
      aria-label={entry.title}
      data-unit-id={entry.id}
    >
      <span className="guide-map-unit-text">
        <strong>{entry.title}</strong>
      </span>
      <ArrowUpLeft size={18} aria-hidden="true" />
    </button>
  );
}

function OrganizationTeam({
  unitId,
  roles,
  entries,
  onSelect,
}: {
  unitId: string;
  roles: string[];
  entries: Map<string, StructureEntry>;
  onSelect: (entry: StructureEntry) => void;
}) {
  return (
    <section className="guide-map-team">
      <UnitCardButton unitId={unitId} entries={entries} onSelect={onSelect} small />
      {roles.length > 0 && (
        <>
          <div className="guide-map-team-link" aria-hidden="true" />
          <div className="guide-map-team-roles">
            {roles.map((roleId) => (
              <div className="guide-map-team-role" key={roleId}>
                <EntryButton entryId={roleId} entries={entries} onSelect={onSelect} compact />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function StructureDialog({
  entry,
  entries,
  onSelect,
  onClose,
}: {
  entry: StructureEntry;
  entries: Map<string, StructureEntry>;
  onSelect: (next: StructureEntry) => void;
  onClose: () => void;
}) {
  const Icon = entry.kind === "role" ? BadgeCheck : entry.kind === "board" ? UsersRound : Network;
  const children = (entry.childIds || [])
    .map((id) => entries.get(id))
    .filter((item): item is StructureEntry => Boolean(item));

  return (
    <TeamDialog title={entry.title} onClose={onClose}>
      <div className="guide-role-dialog-intro">
        <span className="guide-role-dialog-icon" aria-hidden="true">
          <Icon size={25} />
        </span>
        <div>
          <h3>{entry.title}</h3>
        </div>
      </div>
      {children.length > 0 && (
        <div className="guide-dialog-children">
          <div className="guide-map-dialog-roles">
            {children.map((child) => (
              <EntryButton
                key={child.id}
                entryId={child.id}
                entries={entries}
                onSelect={onSelect}
                compact
              />
            ))}
          </div>
        </div>
      )}
      <GuideGovernanceBlocks blocks={entry.blocks} />
      <div className="team-dialog-footer">
        <button type="button" className="team-button" onClick={onClose}>
          إغلاق
        </button>
      </div>
    </TeamDialog>
  );
}

export default function GuideStructure({ source }: { source: string }) {
  const { chapters, entries } = useMemo(() => parseStructureBook(source), [source]);
  const [mode, setMode] = useState<ViewMode>("map");
  const [selected, setSelected] = useState<StructureEntry | null>(null);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#guide-structure-book") setMode("book");
      else if (window.location.hash === "#guide-structure-map") setMode("map");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const chooseMode = (next: ViewMode) => {
    setMode(next);
    if (typeof window !== "undefined") {
      const hash = next === "book" ? "#guide-structure-book" : "#guide-structure-map";
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search + hash,
      );
    }
  };

  function onModeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: ViewMode =
      event.key === "Home"
        ? "map"
        : event.key === "End"
          ? "book"
          : mode === "map"
            ? "book"
            : "map";
    chooseMode(next);
    document.getElementById(`guide-structure-mode-${next}`)?.focus();
  }

  const openById = (id: string) => {
    const entry = entries.get(id);
    if (entry) setSelected(entry);
  };

  return (
    <>
      <section
        id="guide-structure-map"
        tabIndex={-1}
        className="guide-structure"
        aria-label="الباب الثاني: الهيكل الإداري والأدوار والصلاحيات"
      >
        <div
          className="guide-structure-modes"
          role="tablist"
          aria-label="طريقة عرض الهيكل الإداري"
          onKeyDown={onModeKeyDown}
        >
          <button
            type="button"
            id="guide-structure-mode-map"
            role="tab"
            aria-selected={mode === "map"}
            tabIndex={mode === "map" ? 0 : -1}
            className="guide-structure-mode-tab"
            onClick={() => chooseMode("map")}
          >
            <Network size={18} aria-hidden="true" />
            <span>الهيكل المرسوم</span>
          </button>
          <button
            type="button"
            id="guide-structure-mode-book"
            role="tab"
            aria-selected={mode === "book"}
            tabIndex={mode === "book" ? 0 : -1}
            className="guide-structure-mode-tab"
            onClick={() => chooseMode("book")}
          >
            <BookOpen size={18} aria-hidden="true" />
            <span>الكتيب</span>
          </button>
        </div>

        {mode === "map" && (
          <div
            role="tabpanel"
            aria-labelledby="guide-structure-mode-map"
            className="guide-map"
            aria-label="الهيكل التنظيمي التفاعلي لصحوة"
          >
            <div className="guide-map-board-wrap">
              <article className="guide-map-board" aria-label="مجلس الإدارة المركزي">
                <button
                  type="button"
                  className="guide-map-board-trigger"
                  onClick={() => openById("board")}
                  data-role-id="board"
                  aria-label="مجلس الإدارة المركزي"
                >
                  <span className="guide-map-board-symbol">
                    <UsersRound size={26} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>مجلس الإدارة المركزي</strong>
                  </span>
                  <ArrowUpLeft size={20} aria-hidden="true" />
                </button>
              </article>

              <div className="guide-map-council-link" aria-hidden="true" />
              <section
                className="guide-map-council-members"
                aria-label="أعضاء مجلس الإدارة المركزي"
              >
                <div className="guide-map-council-heading">مجلس الإدارة المركزي</div>
                <div className="guide-map-board-members">
                  {councilRoles.map((roleId) => (
                    <div className="guide-map-council-member" key={roleId}>
                      <EntryButton entryId={roleId} entries={entries} onSelect={setSelected} compact />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="guide-map-stem" aria-hidden="true"><span /></div>

            <div className="guide-map-branches">
              <article className="guide-map-branch guide-map-branch-university">
                <div className="guide-map-branch-head">
                  <Building2 size={22} aria-hidden="true" />
                  <span>مسار الجامعات</span>
                </div>
                <UnitCardButton unitId="universities" entries={entries} onSelect={setSelected} />
                <div className="guide-map-branch-root-link" aria-hidden="true" />

                <div className="guide-map-branch-tree">
                  <div className="guide-map-tree-tier">
                    <div className="guide-map-subheading"><span>مجلس إدارة الجامعة</span></div>
                    <div className="guide-map-single-node">
                      <UnitCardButton unitId="university-board" entries={entries} onSelect={setSelected} small />
                    </div>
                  </div>

                  <div className="guide-map-tree-tier">
                    <div className="guide-map-subheading"><span>فريقا الشباب والطالبات</span></div>
                    <div className="guide-map-pair">
                      <OrganizationTeam
                        unitId="university-youth"
                        roles={[
                          "university-youth-coordinator",
                          "internal-youth-activities",
                          "university-youth-activities-member",
                        ]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                      <OrganizationTeam
                        unitId="university-women"
                        roles={[
                          "university-women-coordinator",
                          "internal-women-activities",
                          "university-women-activities-member",
                        ]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                    </div>
                  </div>

                  <div className="guide-map-tree-tier">
                    <div className="guide-map-subheading"><span>الفرق المساندة داخل الجامعة</span></div>
                    <div className="guide-map-pair">
                      <OrganizationTeam
                        unitId="university-relations"
                        roles={["university-relations-lead", "university-relations-member"]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                      <OrganizationTeam
                        unitId="university-media"
                        roles={["field-media-member"]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                    </div>
                  </div>

                  <div className="guide-map-tree-tier">
                    <div className="guide-map-subheading"><span>اللجان الإضافية والمتطوعون داخل الجامعة</span></div>
                    <div className="guide-map-pair">
                      <div className="guide-map-team">
                        <UnitCardButton unitId="additional-committees" entries={entries} onSelect={setSelected} small />
                      </div>
                      <div className="guide-map-team">
                        <EntryButton entryId="university-volunteers" entries={entries} onSelect={setSelected} />
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="guide-map-branch guide-map-branch-central">
                <div className="guide-map-branch-head">
                  <GitBranch size={22} aria-hidden="true" />
                  <span>المسار المشترك بين الجامعات</span>
                </div>
                <UnitCardButton unitId="central" entries={entries} onSelect={setSelected} />
                <div className="guide-map-branch-root-link" aria-hidden="true" />

                <div className="guide-map-branch-tree">
                  <div className="guide-map-tree-tier">
                    <div className="guide-map-subheading"><span>فرق الأنشطة المركزية</span></div>
                    <div className="guide-map-pair">
                      <OrganizationTeam
                        unitId="central-youth"
                        roles={["central-youth-lead", "central-youth-member"]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                      <OrganizationTeam
                        unitId="central-women"
                        roles={["central-women-lead", "central-women-member"]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                    </div>
                  </div>

                  <div className="guide-map-tree-tier">
                    <div className="guide-map-subheading"><span>الإعلام والعلاقات المركزية</span></div>
                    <div className="guide-map-pair">
                      <OrganizationTeam
                        unitId="central-media"
                        roles={["central-media-lead", "central-media-member"]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                      <OrganizationTeam
                        unitId="central-relations"
                        roles={["central-relations-lead", "central-relations-member"]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                    </div>
                  </div>

                  <div className="guide-map-tree-tier">
                    <div className="guide-map-subheading"><span>الوحدات المركزية</span></div>
                    <div className="guide-map-pair">
                      <OrganizationTeam
                        unitId="expansion"
                        roles={["expansion-lead", "expansion-member"]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                      <OrganizationTeam
                        unitId="technology"
                        roles={["technology-lead", "technology-member"]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                    </div>
                    <div className="guide-map-single-team">
                      <OrganizationTeam
                        unitId="programs"
                        roles={["programs-lead", "programs-member"]}
                        entries={entries}
                        onSelect={setSelected}
                      />
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="guide-map-stem" aria-hidden="true"><span /></div>

            <article className="guide-map-branch guide-map-branch-support">
              <div className="guide-map-branch-head">
                <ShieldCheck size={22} aria-hidden="true" />
                <span>المساندة الإدارية والمتابعة والمراجعة والتظلمات</span>
              </div>
              <UnitCardButton unitId="admin-support" entries={entries} onSelect={setSelected} />
              <div className="guide-map-branch-root-link" aria-hidden="true" />
              <div className="guide-map-support-grid">
                <OrganizationTeam
                  unitId="finance"
                  roles={["finance-lead", "finance-member"]}
                  entries={entries}
                  onSelect={setSelected}
                />
                <OrganizationTeam
                  unitId="records"
                  roles={["records-lead", "records-member"]}
                  entries={entries}
                  onSelect={setSelected}
                />
                <OrganizationTeam
                  unitId="review"
                  roles={["review-lead", "review-member"]}
                  entries={entries}
                  onSelect={setSelected}
                />
              </div>
            </article>

            <div className="guide-map-participation-strip" aria-label="مستويات المشاركة وقيادة الفعاليات والإنابة">
              <EntryButton entryId="membership-levels" entries={entries} onSelect={setSelected} />
              <EntryButton entryId="university-volunteers" entries={entries} onSelect={setSelected} />
              <EntryButton entryId="event-lead" entries={entries} onSelect={setSelected} />
              <EntryButton entryId="deputy-rules" entries={entries} onSelect={setSelected} />
            </div>
          </div>
        )}

        {mode === "book" && (
          <div role="tabpanel" aria-labelledby="guide-structure-mode-book">
            <GuideBooklet
              title="الهيكل الإداري والأدوار والصلاحيات"
              filename="sahwa-structure-booklet"
              chapters={chapters}
            />
          </div>
        )}
      </section>

      {selected && (
        <StructureDialog
          entry={selected}
          entries={entries}
          onSelect={setSelected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
