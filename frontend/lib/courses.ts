export interface Course {
  slug: string;
  title: string;
  desc: string;
  hours?: string;
  level?: string;
  img: string;
  alt: string;
  topic?: string; // AI & Machine Learning, Design, Development, Automation
  // 详情页扩展
  fullDesc?: string;
  lessons?: number;
  syllabus?: SyllabusModule[];
  instructor?: {
    name: string;
    role: string;
    bio: string;
    img: string;
  };
}

export interface SyllabusModule {
  title: string;
  lessonCount: number;
  lessons: { title: string; duration: string }[];
}

export const COURSES: Course[] = [
  {
    slug: "ai-foundations",
    title: "求职简历优化：用 AI 打造亮眼简历",
    desc: "零门槛实操，从准备简历文档到 AI 优化润色，产出可直接投递的成果。适合应届生、求职者。",
    hours: "2 小时",
    level: "入门",
    topic: "求职就业",
    img: "/images/course-ai-foundations.jpg",
    alt: "Abstract colorful neural network connection wires",
    fullDesc:
      "零门槛实操，从准备简历文档到 AI 优化润色，产出可直接投递的成果。适合应届生、求职者。",
    lessons: 6,
    syllabus: [
      {
        title: "准备工作",
        lessonCount: 2,
        lessons: [
          { title: "准备简历文档", duration: "5:00" },
          { title: "选择 AI 工具（Kimi / Trae）", duration: "8:00" },
        ],
      },
      {
        title: "简历优化实操",
        lessonCount: 3,
        lessons: [
          { title: "提炼岗位关键词", duration: "10:00" },
          { title: "用 AI 润色经历描述", duration: "15:00" },
          { title: "整体优化与检查", duration: "12:00" },
        ],
      },
      {
        title: "成果输出",
        lessonCount: 1,
        lessons: [
          { title: "导出最终版本", duration: "5:00" },
        ],
      },
    ],
    instructor: {
      name: "产品负责人",
      role: "产品 & 设计",
      bio: "专注于 AI 应用教育，帮助普通人通过实践掌握 AI 能力。",
      img: "/images/founder-david.jpg",
    },
  },
  {
    slug: "generative-design",
    title: "论文文献整理：AI 助你高效调研",
    desc: "用 AI 工具快速整理文献、提炼要点、搭建知识框架。场景真实，步骤可复现，适合研究生、科研工作者。",
    hours: "3 小时",
    level: "入门",
    topic: "论文调研",
    img: "/images/course-generative-design.jpg",
    alt: "Symmetric fractal art with deep blue and purple hues",
    instructor: {
      name: "技术负责人",
      role: "技术 & 运营",
      bio: "专注于技术实现与运营。",
      img: "/images/founder-elena.jpg",
    },
  },
  {
    slug: "llm-engineering",
    title: "家庭教育方案：AI 设计个性化学习计划",
    desc: "根据孩子情况，用 AI 生成可落地的学习方案和资源推荐。解决家长真实痛点，成果可直接使用。",
    hours: "2 小时",
    level: "入门",
    topic: "家庭教育",
    img: "/images/course-llm-engineering.jpg",
    alt: "Source code on a screen with blue syntax highlighting",
    instructor: {
      name: "运营负责人",
      role: "开发 & 助理",
      bio: "专注于 AI 应用研究与开发。",
      img: "/images/founder-jameson.jpg",
    },
  },
];

// 课程列表页展示的课程（来自 courses-list.html）
export const COURSES_CATALOG: Course[] = [
  {
    slug: "neural-network-architectures",
    title: "文献综述：用 AI 快速梳理研究脉络",
    desc: "用 AI 工具整理文献、提炼要点、搭建知识框架，提升论文调研效率。",
    topic: "论文调研",
    img: "/images/course-neural-network.jpg",
    alt: "Futuristic neural network visualization in neon colors",
    instructor: {
      name: "产品负责人",
      role: "产品 & 设计",
      bio: "专注于 AI 应用教育，帮助普通人通过实践掌握 AI 能力。",
      img: "/images/founder-david.jpg",
    },
  },
  {
    slug: "ui-ux-design-masterclass",
    title: "工作汇报：AI 助你高效制作 PPT",
    desc: "用 AI 快速生成结构清晰、视觉专业的汇报材料，提升工作效率。",
    topic: "工作效率",
    img: "/images/course-ui-ux-design.jpg",
    alt: "Clean workspace with design tools and prototypes",
  },
  {
    slug: "full-stack-ecosystems",
    title: "邮件与文档：AI 润色与批量处理",
    desc: "用 AI 优化邮件措辞、润色文档，批量处理重复性写作任务。",
    topic: "工作效率",
    img: "/images/course-full-stack.jpg",
    alt: "Software code on a high resolution screen",
  },
  {
    slug: "process-engineering",
    title: "自动化工作流：让 AI 替你处理重复任务",
    desc: "用 AI 工具搭建自动化流程，解放双手，专注高价值工作。",
    topic: "工作效率",
    img: "/images/course-process-engineering.jpg",
    alt: "Abstract representation of automated workflows",
  },
  {
    slug: "predictive-data-modeling",
    title: "投资信息分析：AI 辅助决策",
    desc: "用 AI 整理投资信息、提炼要点，辅助个人理财决策。",
    topic: "论文调研",
    img: "/images/course-predictive-modeling.jpg",
    alt: "Complex data visualizations on a dashboard",
  },
  {
    slug: "systems-optimization",
    title: "创意应用：用 AI 探索更多可能",
    desc: "探索 AI 在创意、内容创作等场景的应用，拓展个人能力边界。",
    topic: "工作效率",
    img: "/images/course-systems-optimization.jpg",
    alt: "Hardware parts and fiber optic lights",
  },
];

// 全部课程：Core Courses 前 3 个 + 课程目录 6 个
export const ALL_COURSES: Course[] = [...COURSES, ...COURSES_CATALOG];

export function getCourseBySlug(slug: string): Course | undefined {
  return [...COURSES, ...COURSES_CATALOG].find((c) => c.slug === slug);
}
