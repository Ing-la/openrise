import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "内容库 | 零壹",
  description:
    "零门槛学习，场景实战，成果可见。从真实场景中掌握 AI 应用能力。",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
