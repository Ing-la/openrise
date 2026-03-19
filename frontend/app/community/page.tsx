import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "社区 | OpenRise",
  description:
    "加入 OpenRise 社区。与志同道合的人一起维护、贡献内容，共同成长。",
};

export default function CommunityPage() {
  return (
    <ComingSoon
      title="社区：敬请期待"
      subtitle="我们正在打造一个空间，让志同道合的人一起连接、分享、成长。敬请期待。"
    />
  );
}
