/**
 * Existing public university communities. Names and card copy remain unchanged.
 * SEO-specific synonyms and descriptions are used only in server metadata/JSON-LD.
 */
export const universities = [
  {
    id: "istinye",
    name: "جامعة استنيا",
    nameEn: "Istinye University",
    nameTr: "İstinye Üniversitesi",
    city: "إسطنبول",
    aliases: ["جامعة استينيا", "جامعة إستينيا", "جامعة استينيه", "استنيت", "Istinye", "İstinye"],
    description: "مجتمع طلابي نشط يجمع طلاب استنيا حول الصحبة الصالحة والوعي",
    seoDescription: "مجتمع صحوة الطلابي في جامعة استنيا بإسطنبول، للصحبة الصالحة والقرآن والتعارف بين طلاب İstinye Üniversitesi.",
    introduction: "مرحبًا بكم في صحوة استنيا. نحن مجموعة من الطلاب نسعى لبناء بيئة صحية تُعين على الثبات والوعي خلال الحياة الجامعية.",
    studentMessage: "نحن طلاب مثلكم، نفهم تحديات الحياة الجامعية ونسعى معًا للنمو والتطور. انضموا إلينا لنكون صحبة تعين بعضها على الخير.",
    whatsappGroup: "https://chat.whatsapp.com/K3j6B1lcA42B80O1KpTLFO",
  },
  {
    id: "bilgi",
    name: "جامعة بلجي",
    nameEn: "Bilgi University",
    nameTr: "İstanbul Bilgi Üniversitesi",
    city: "إسطنبول",
    aliases: ["جامعة بيلجي", "جامعة بيلغي", "Istanbul Bilgi University", "Bilgi", "بيلجي"],
    description: "مساحة شبابية لطلاب بلجي تنطلق من هوية الأمة",
    seoDescription: "صحوة بلجي مجتمع طلابي لطلاب جامعة بلجي في إسطنبول للتعارف والصحبة والأنشطة الطلابية النافعة.",
    introduction: "أهلًا بكم في صحوة بلجي. نجتمع هنا لنعيش قيمنا بوعي وإخلاص في حياتنا اليومية كطلاب جامعيين.",
    studentMessage: "في بلجي، نبني مجتمعًا طلابيًا يجمعنا حول القيم والوعي. كن جزءًا من رحلتنا.",
    whatsappGroup: "https://chat.whatsapp.com/BrHWBBCth9nCyxDw4a8pdH",
  },
  {
    id: "gelisim",
    name: "جامعة جيليشيم",
    nameEn: "Gelişim University",
    nameTr: "İstanbul Gelişim Üniversitesi",
    city: "إسطنبول",
    aliases: ["جامعة جليشم", "جامعة جليشيم", "جامعة جيليشم", "Gelisim University", "Gelişim", "جليشم"],
    description: "مجتمع طلابي يجمع طلاب جيليشيم حول القيم والوعي",
    seoDescription: "صحوة جيليشيم مجتمع طلابي لطلاب جامعة جيليشيم في إسطنبول للصحبة الصالحة والتعارف والمبادرات الطلابية.",
    introduction: "مرحبًا بكم في صحوة جيليشيم. نحن مجموعة من الطلاب نسعى لبناء بيئة صحية تُعين على الثبات والوعي خلال الحياة الجامعية.",
    studentMessage: "نحن طلاب مثلكم، نفهم تحديات الحياة الجامعية ونسعى معًا للنمو والتطور. انضموا إلينا لنكون صحبة تعين بعضها على الخير.",
    whatsappGroup: "https://chat.whatsapp.com/JFewtz9mYMHFNOWDXjNAsB",
  },
] as const;

export type SahwaUniversity = (typeof universities)[number];

export function getUniversityById(id: string): SahwaUniversity | undefined {
  return universities.find((university) => university.id === id);
}
