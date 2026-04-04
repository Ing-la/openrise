import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 从 lib/courses.ts 复制的课程数据，避免导入问题
const ALL_COURSES = [
  {
    slug: "ai-foundations",
    title: "求职简历优化：用 AI 打造亮眼简历",
    desc: "零门槛实操，从准备简历文档到 AI 优化润色，产出可直接投递的成果。适合应届生、求职者。",
    hours: "2 小时",
    level: "入门",
    topic: "求职就业",
    img: "/images/course-ai-foundations.jpg",
    alt: "Abstract colorful neural network connection wires",
    fullDesc: "零门槛实操，从准备简历文档到 AI 优化润色，产出可直接投递的成果。适合应届生、求职者。",
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

async function main() {
  console.log("开始初始化数据库种子数据...");

  // 1. 创建或获取 01builder 用户
  const builderEmail = "01builder@openrise.com";
  const builderPassword = "01builder_password_123";
  const passwordHash = await bcrypt.hash(builderPassword, 10);

  let builderUser = await prisma.user.findUnique({
    where: { email: builderEmail },
  });

  if (!builderUser) {
    builderUser = await prisma.user.create({
      data: {
        email: builderEmail,
        passwordHash,
        name: "OpenRise官方",
        avatarUrl: "/images/logo.jpg",
        role: "平台管理员",
        bio: "OpenRise平台官方账号，管理所有示例课程和占位内容。",
        emailVerified: new Date(), // 标记为已验证
      },
    });
    console.log(`创建 01builder 用户: ${builderUser.id}`);
  } else {
    console.log(`使用现有 01builder 用户: ${builderUser.id}`);
  }

  // 2. 检查是否已存在示例课程，如果存在则删除（确保占位课程最新）
  const existingCourses = await prisma.course.findMany({
    where: { userId: builderUser.id },
  });

  if (existingCourses.length > 0) {
    console.log(`删除 ${existingCourses.length} 个现有示例课程...`);
    // 使用 deleteMany 会级联删除关联的 chapters 和 lessons
    await prisma.course.deleteMany({
      where: { userId: builderUser.id },
    });
    console.log(`现有示例课程已删除`);
  }

  // 3. 创建示例课程（从 courses.ts 转换）
  console.log("创建示例课程...");

  for (const [index, staticCourse] of ALL_COURSES.entries()) {
    console.log(`创建课程: ${staticCourse.title} (${staticCourse.slug})`);

    // 创建课程
    const course = await prisma.course.create({
      data: {
        title: staticCourse.title,
        description: `[示例:${staticCourse.slug}] ${staticCourse.desc}`,
        coverImageUrl: staticCourse.img,
        isPublic: true, // 所有示例课程都是公开的
        userId: builderUser.id,
      },
    });

    // 如果有 syllabus，创建章节和小节
    if (staticCourse.syllabus && staticCourse.syllabus.length > 0) {
      for (const [chapterIndex, module] of staticCourse.syllabus.entries()) {
        const chapter = await prisma.chapter.create({
          data: {
            title: module.title,
            courseId: course.id,
            sortOrder: chapterIndex,
          },
        });

        // 为每个课程创建示例小节
        if (module.lessons && module.lessons.length > 0) {
          for (const [lessonIndex, lessonData] of module.lessons.entries()) {
            // 使用 Markdown 类型的"敬请期待"内容
            await prisma.lesson.create({
              data: {
                title: lessonData.title,
                type: "markdown",
                content: `## ${lessonData.title}\n\n课程内容正在准备中，敬请期待！\n\n> 这是OpenRise平台的示例课程，用于展示课程结构和功能。`,
                chapterId: chapter.id,
                sortOrder: lessonIndex,
              },
            });
          }
        } else {
          // 如果没有具体的课程，创建一个默认的"课程介绍"小节
          await prisma.lesson.create({
            data: {
              title: "课程介绍",
              type: "markdown",
              content: `# ${module.title}\n\n这是OpenRise平台的示例课程章节，用于展示课程结构和功能。\n\n课程内容正在准备中，敬请期待！`,
              chapterId: chapter.id,
              sortOrder: 0,
            },
          });
        }
      }
    } else {
      // 如果没有 syllabus，创建一个默认章节和小节
      const chapter = await prisma.chapter.create({
        data: {
          title: "课程介绍",
          courseId: course.id,
          sortOrder: 0,
        },
      });

      await prisma.lesson.create({
        data: {
          title: "课程概述",
          type: "markdown",
          content: `# ${staticCourse.title}\n\n${staticCourse.desc}\n\n课程内容正在准备中，敬请期待！\n\n> 这是OpenRise平台的示例课程，用于展示课程结构和功能。`,
          chapterId: chapter.id,
          sortOrder: 0,
        },
      });
    }
  }

  console.log(`成功创建 ${ALL_COURSES.length} 个示例课程`);
}

main()
  .catch((e) => {
    console.error("种子脚本执行失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });