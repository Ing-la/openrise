import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "资源 | Zero One",
  description:
    "Zero One 资源中心。指南、教程和工具，助力你的 AI 应用学习之旅。",
};

export default function ResourcesPage() {
  return (
    <ComingSoon
      title="资源中心：敬请期待"
      subtitle="我们正在整理指南、教程和工具，帮助普通人更快上手 AI 应用。敬请期待。"
    />
  );
}
