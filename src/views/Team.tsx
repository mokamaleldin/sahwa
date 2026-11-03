"use client";

import {
  ArrowUpLeft,
  CalendarDays,
  ClipboardList,
  FolderOpen,
  Palette,
  UsersRound,
} from "lucide-react";
import { Link } from "../lib/navigation";
import { Helmet } from "react-helmet-async";
import PageHeading from "../components/shared/PageIdentity";
import { useSession } from "../auth/useSession";

const cards = [
  {
    title: "سجل الفعاليات",
    description:
      "ما أنجزناه معًا؛ اسم الفعالية، موعدها، مسؤولها وعدد الحضور إن توفر.",
    to: "/team/events",
    icon: CalendarDays,
    action: "فتح سجل الفعاليات",
    admin: true,
  },
  {
    title: "المتطوعون والحسابات",
    description: "بيانات أهل صحوة الأساسية، وإنشاء حساباتهم وإدارة صلاحياتهم.",
    to: "/team/volunteers",
    icon: UsersRound,
    action: "فتح دليل المتطوعين",
    admin: true,
  },
  {
    title: "الملفات",
    description:
      "مجلدات الإعلام، الاجتماعات، توثيق الفعاليات، وأدلة العمل في صحوة.",
    to: "/team/files",
    icon: FolderOpen,
    action: "الوصول إلى الملفات",
  },
  {
    title: "النماذج المهمة",
    description:
      "شارك شكوى أو اقتراحًا، أو أضف فكرة لنشاط أو محتوى إعلامي إلى بنك أفكار صحوة.",
    to: "/team/forms",
    icon: ClipboardList,
    action: "الوصول إلى النماذج",
  },
  {
    title: "استوديو صحوة",
    description:
      "القوالب وأدوات التصميم التي تعرفها. جهّز منشوراتك بهوية صحوة.",
    to: "/studio",
    icon: Palette,
    action: "الدخول إلى الاستوديو",
  },
];

export default function Team() {
  const { user } = useSession();
  const visibleCards = cards.filter(
    (card) => !card.admin || user?.accessRole === "admin",
  );
  return (
    <>
      <Helmet>
        <title>مساحة الفريق | صحوة</title>
      </Helmet>
      <PageHeading
        title="مساحة فريق صحوة"
        description="فريقنا، ملفاتنا، وأدواتنا… كلها قريبة منك."
      />
      {user && (
        <div className="team-welcome">
          <div>
            <strong>أهلًا، {user.fullName}</strong>
            <span>{user.university}</span>
          </div>
          <span className="team-status">
            {user.accessRole === "admin" ? "مسؤول" : "متطوع عادي"}
          </span>
        </div>
      )}
      <section
        className={`team-portal-grid${visibleCards.length === 2 ? " team-portal-grid-two" : ""}`}
        aria-label="أقسام مساحة الفريق"
      >
        {visibleCards.map(
          ({ title, description, to, icon: Icon, action }, index) => {
            const content = (
              <>
                <div className="team-portal-top">
                  <span className="team-icon">
                    <Icon size={29} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="team-card-number">0{index + 1}</span>
                </div>
                <h2 className="font-heading">{title}</h2>
                <p>{description}</p>
                <span className="team-card-action">
                  {action}
                  <ArrowUpLeft size={18} aria-hidden="true" />
                </span>
              </>
            );
            return (
              <Link className="team-portal-card" to={to} key={to}>
                {content}
              </Link>
            );
          },
        )}
      </section>
    </>
  );
}
