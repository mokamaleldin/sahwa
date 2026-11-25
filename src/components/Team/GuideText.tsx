const identityAnchors: Record<string, string> = {
  "أولًا: من نحن؟": "guide-identity-about",
  "ثانيًا: كيف بدأت صحوة؟": "guide-identity-story",
  "أولًا: رؤيتنا": "guide-identity-vision",
  "ثالثًا: أهدافنا الأربعة": "guide-identity-goals",
  "ثالثًا: مستويات العلاقة بصحوة": "guide-identity-community",
  "ثانيًا: مبادئنا العامة": "guide-identity-principles",
};

const headings = ["h2", "h3", "h4", "h5"] as const;

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : part,
  );
}

export default function GuideText({ source, identity = false }: { source: string; identity?: boolean }) {
  return (
    <div className="guide-reading-text">
      {source.replace(/^[\r\n]+|[\r\n]+$/g, "").split(/\r?\n(?:[ \t]*\r?\n)+/).map((block, index) => {
        if (block === "---") return <hr key={index} />;
        const heading = /^(#{1,4}) (.+)$/.exec(block);
        if (heading) {
          const Tag = headings[heading[1].length - 1];
          return <Tag key={index} id={identity ? identityAnchors[heading[2]] : undefined}>{inline(heading[2])}</Tag>;
        }
        if (block.startsWith("- ")) {
          return (
            <ul key={index}>
              {block.split(/\r?\n/).map((line, i) => {
                const text = line.slice(2);
                return (
                  <li key={i}>
                    {text === "رسم خطوط القيادة والتبعية والتنسيق."
                      ? <a href="/team/guide/structure">{text}</a>
                      : inline(text)}
                  </li>
                );
              })}
            </ul>
          );
        }
        return (
          <p key={index}>
            {block === "الباب الأول: الهوية والرؤية والمبادئ"
              ? <a href="#guide-identity-details">{block}</a>
              : inline(block)}
          </p>
        );
      })}
    </div>
  );
}
