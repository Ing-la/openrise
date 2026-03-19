import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "定价 | OpenRise",
  description:
    "OpenRise 定价方案。找到适合你的 AI 学习计划。",
};

export default function PricingPage() {
  return (
    <ComingSoon
      title="定价：敬请期待"
      subtitle="我们正在设计灵活的方案，帮助你释放 AI 学习的全部潜力。敬请期待。"
    />
  );
}
