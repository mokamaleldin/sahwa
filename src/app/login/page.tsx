import type { Metadata } from "next";
import View from "../../views/Login";

export const metadata: Metadata = {
  title: "تسجيل الدخول إلى مساحة الفريق",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <View />;
}
