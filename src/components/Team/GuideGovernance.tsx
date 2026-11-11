import { Fragment } from "react";
import {
  governanceTopics,
  type GovernanceBlock,
} from "../../data/sahwaGovernance";

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index}>{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function GuideGovernanceBlocks({ blocks }: { blocks: GovernanceBlock[] }) {
  return (
    <div className="guide-governance-content">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return <h4 key={index}>{block.text}</h4>;
        }
        if (block.kind === "paragraph") {
          return <p key={index}><RichText text={block.text} /></p>;
        }
        if (block.kind === "list") {
          const items = block.items.map((item, itemIndex) => (
            <li key={itemIndex}><RichText text={item} /></li>
          ));
          return block.ordered
            ? <ol key={index}>{items}</ol>
            : <ul key={index}>{items}</ul>;
        }
        if (block.kind === "table") {
          return (
            <div className="guide-governance-table-wrap" key={index} role="region" aria-label="جدول توزيع القرارات" tabIndex={0}>
              <table>
                <thead><tr>{block.headers.map((heading, hIndex) => <th key={hIndex} scope="col">{heading}</th>)}</tr></thead>
                <tbody>{block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>{row.map((cell, cIndex) => <td key={cIndex}><RichText text={cell} /></td>)}</tr>
                ))}</tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function GuideGovernanceTopics() {
  const descriptions: Record<string, string> = {
    events: "ملكية الفعاليات، توزيع القرارات، الخلافات والتدخل عند الأزمات.",
    programs: "الفرق بين إدارة النشاط واعتماد محتواه العلمي، والوحدة المقترحة.",
    reports: "ما يرفعه المسؤولون وقادة الفعاليات، دون تعقيد إداري.",
    pending: "بنود ما زالت تحتاج اعتمادًا مثل التعيين والتصويت والتفويض.",
  };
  return (
    <section className="guide-governance-topics" aria-labelledby="guide-governance-title">
      <div className="guide-section-heading">
        <span>قواعد العمل بين الفرق</span>
        <h2 id="guide-governance-title">القرارات والإجراءات المشتركة</h2>
        <p>التفاصيل التنظيمية الواردة في مسودة الهيكل. البنود المقترحة ليست قرارات نافذة قبل اعتمادها.</p>
      </div>
      <div className="guide-governance-topic-list">
        {governanceTopics.map((topic, index) => (
          <details className="guide-governance-topic" key={topic.id} id={`guide-governance-${topic.id}`}>
            <summary>
              <span className="guide-governance-topic-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="guide-governance-topic-label">
                <strong>{topic.title}</strong>
                <small>{descriptions[topic.id]}</small>
              </span>
              <span className="guide-governance-topic-action" aria-hidden="true">+</span>
            </summary>
            <GuideGovernanceBlocks blocks={topic.blocks} />
          </details>
        ))}
      </div>
    </section>
  );
}
