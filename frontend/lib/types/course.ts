import { Prisma } from "@prisma/client";

// ==================== 数据库实体类型 ====================

/**
 * 课程数据库实体（完整关系）
 */
export type CourseEntity = Prisma.CourseGetPayload<{
  include: {
    user: true;
    chapters: {
      include: {
        lessons: true;
      };
    };
  };
}>;

/**
 * 课程数据库实体（最小化查询）
 */
export type CourseEntityMinimal = Prisma.CourseGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    coverImageUrl: true;
    isPublic: true;
    userId: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

/**
 * 章节数据库实体
 */
export type ChapterEntity = Prisma.ChapterGetPayload<{
  include: {
    lessons: true;
    course: true;
  };
}>;

/**
 * 小节数据库实体
 */
export type LessonEntity = Prisma.LessonGetPayload<{
  include: {
    chapter: {
      include: {
        course: true;
      };
    };
  };
}>;

// ==================== DTO（数据传输对象） ====================

/**
 * 公开课程DTO（API返回给前端）
 */
export interface PublicCourseDto {
  id: string;
  slug: string; // 使用id作为slug
  title: string;
  description?: string;
  coverImageUrl?: string;
  isPublic: boolean;
  lessonCount: number;
  instructor?: {
    name: string;
    role?: string;
    bio?: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 课程详情DTO（包含大纲）
 */
export interface CourseDetailDto extends PublicCourseDto {
  syllabus: SyllabusModuleDto[];
}

/**
 * 大纲模块DTO
 */
export interface SyllabusModuleDto {
  title: string;
  lessonCount: number;
  lessons: LessonItemDto[];
}

/**
 * 小节项DTO
 */
export interface LessonItemDto {
  id: string;
  title: string;
  type: 'video' | 'markdown';
  duration?: string;
}

/**
 * 小节详情DTO
 */
export interface LessonDetailDto {
  id: string;
  title: string;
  type: 'video' | 'markdown';
  content?: string;
  videoUrl?: string;
  platform?: string;
  chapter: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      isPublic: boolean;
    };
  };
  createdAt: Date;
}

/**
 * 管理课程DTO（作者可见的扩展信息）
 */
export interface ManagedCourseDto extends PublicCourseDto {
  userId: string;
  // 可以添加管理专用字段
}

// ==================== 转换函数 ====================

/**
 * 将数据库实体转换为公开课程DTO
 */
export function courseEntityToPublicDto(course: CourseEntityMinimal): PublicCourseDto {
  return {
    id: course.id,
    slug: course.id, // 使用id作为slug
    title: course.title,
    description: course.description ?? undefined,
    coverImageUrl: course.coverImageUrl ?? undefined,
    isPublic: course.isPublic,
    lessonCount: 0, // 需要额外查询
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

/**
 * 将数据库实体转换为课程详情DTO
 */
export function courseEntityToDetailDto(course: CourseEntity): CourseDetailDto {
  const lessonCount = course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);

  const syllabus: SyllabusModuleDto[] = course.chapters.map(chapter => ({
    title: chapter.title,
    lessonCount: chapter.lessons.length,
    lessons: chapter.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type as 'video' | 'markdown',
      duration: '-', // 可以扩展
    })),
  }));

  return {
    id: course.id,
    slug: course.id,
    title: course.title,
    description: course.description ?? undefined,
    coverImageUrl: course.coverImageUrl ?? undefined,
    isPublic: course.isPublic,
    lessonCount,
    instructor: course.user ? {
      name: course.user.name ?? '匿名',
      role: course.user.role ?? undefined,
      bio: course.user.bio ?? undefined,
      avatarUrl: course.user.avatarUrl ?? undefined,
    } : undefined,
    syllabus,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

/**
 * 将数据库实体转换为小节详情DTO
 */
export function lessonEntityToDetailDto(lesson: LessonEntity): LessonDetailDto {
  return {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type as 'video' | 'markdown',
    content: lesson.content ?? undefined,
    videoUrl: lesson.videoUrl ?? undefined,
    platform: lesson.platform ?? undefined,
    chapter: {
      id: lesson.chapter.id,
      title: lesson.chapter.title,
      course: {
        id: lesson.chapter.course.id,
        title: lesson.chapter.course.title,
        isPublic: lesson.chapter.course.isPublic,
      },
    },
    createdAt: lesson.createdAt,
  };
}