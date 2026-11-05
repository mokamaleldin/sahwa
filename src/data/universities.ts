/**
 * Public Sahwa university communities (not the universities' official pages).
 * Reused for visible page content, metadata, structured data and sitemap.
 */
export const universities = [
  {
    id: "istinye",
    name: "جامعة استينيا",
    nameEn: "Istinye University",
    nameTr: "İstinye Üniversitesi",
    city: "إسطنبول",
    aliases: ["جامعة استنيا", "جامعة إستينيا", "جامعة استينيه", "استنيت", "Istinye", "İstinye"],
    description: "تعرف على مجتمع صحوة الطلابي في جامعة استينيا بإسطنبول، ومساحة الصحبة الصالحة والقرآن والتعارف بين الطلاب.",
    introduction: "مرحبًا بكم في صحوة استينيا. نحن مجموعة من الطلاب نسعى لبناء بيئة صحية تُعين على الثبات والوعي خلال الحياة الجامعية.",
    studentMessage: "نحن طلاب مثلكم، نفهم تحديات الحياة الجامعية ونسعى معًا للنمو والتطور. انضموا إلينا لنكون صحبة تعين بعضها على الخير.",
    whatsappGroup: "https://chat.whatsapp.com/K3j6B1lcA42B80O1KpTLFO",
  },
  {
    id: "bilgi",
    name: "جامعة بيلجي",
    nameEn: "Istanbul Bilgi University",
    nameTr: "İstanbul Bilgi Üniversitesi",
    city: "إسطنبول",
    aliases: ["جامعة بلجي", "جامعة بيلغي", "Bilgi University", "Bilgi", "بيلجي", "بلجي"],
    description: "اكتشف صحوة بيلجي، مجتمعًا طلابيًا في إسطنبول للتعارف والصحبة والأنشطة النافعة لطلاب جامعة بلجي.",
    introduction: "أهلًا بكم في صحوة بيلجي. نجتمع هنا لنعيش قيمنا بوعي وإخلاص في حياتنا اليومية كطلاب جامعيين.",
    studentMessage: "في بيلجي، نبني مجتمعًا طلابيًا يجمعنا حول القيم والوعي. كن جزءًا من رحلتنا.",
    whatsappGroup: "https://chat.whatsapp.com/BrHWBBCth9nCyxDw4a8pdH",
  },
  {
    id: "gelisim",
    name: "جامعة جيليشيم",
    nameEn: "Istanbul Gelisim University",
    nameTr: "İstanbul Gelişim Üniversitesi",
    city: "إسطنبول",
    aliases: ["جامعة جليشم", "جامعة جليشيم", "جامعة جيليشم", "Gelisim University", "Gelişim", "جليشم"],
    description: "تعرف على مجتمع صحوة الطلابي في جامعة جيليشيم بإسطنبول، وعلى مساحات التعارف والصحبة والمبادرات الطلابية.",
    introduction: "مرحبًا بكم في صحوة جيليشيم. نحن مجموعة من الطلاب نسعى لبناء بيئة صحية تُعين على الثبات والوعي خلال الحياة الجامعية.",
    studentMessage: "نحن طلاب مثلكم، نفهم تحديات الحياة الجامعية ونسعى معًا للنمو والتطور. انضموا إلينا لنكون صحبة تعين بعضها على الخير.",
    whatsappGroup: "https://chat.whatsapp.com/JFewtz9mYMHFNOWDXjNAsB",
  },
] as const;

export type SahwaUniversity = (typeof universities)[number];

export function getUniversityById(id: string): SahwaUniversity | undefined {
  return universities.find((university) => university.id === id);
}
