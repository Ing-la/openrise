import { prisma } from "@/lib/prisma";
import { canViewCourse, canEditCourse, canViewLesson, getViewableCourses } from "@/lib/course-permissions";
import {
  courseEntityToDetailDto,
  lessonEntityToDetailDto,
  type CourseDetailDto,
  type LessonDetailDto,
  type PublicCourseDto
} from "@/lib/types/course";

/**
 * 课程服务 - 统一处理课程相关的业务逻辑
 */
export class CourseService {
  /**
   * 获取可查看的课程列表（公开课程 + 用户自己的私有课程）
   */
  static async getViewableCourses(userId?: string) {
    return getViewableCourses(userId);
  }

  /**
   * 获取课程详情（包含权限校验）
   * @param courseId 课程ID
   * @param userId 用户ID（可选）
   * @returns 课程详情或null（如果没有权限）
   */
  static async getCourseDetail(courseId: string, userId?: string): Promise<CourseDetailDto | null> {
    // 权限校验
    if (!await canViewCourse(courseId, userId)) {
      return null;
    }

    // 查询课程数据
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        user: true,
        chapters: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });

    if (!course) return null;

    // 转换为DTO
    return courseEntityToDetailDto(course);
  }

  /**
   * 获取小节详情（包含权限校验）
   * @param lessonId 小节ID
   * @param userId 用户ID（可选）
   * @returns 小节详情或null（如果没有权限）
   */
  static async getLessonDetail(lessonId: string, userId?: string): Promise<LessonDetailDto | null> {
    // 权限校验
    if (!await canViewLesson(lessonId, userId)) {
      return null;
    }

    // 查询小节数据
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) return null;

    // 转换为DTO
    return lessonEntityToDetailDto(lesson);
  }

  /**
   * 获取公开课程列表（无需登录）
   */
  static async getPublicCourses(): Promise<PublicCourseDto[]> {
    const courses = await prisma.course.findMany({
      where: { isPublic: true },
      include: {
        user: true,
        chapters: {
          include: {
            lessons: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return courses.map(course => {
      const lessonCount = course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);

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
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });
  }

  /**
   * 获取用户创建的课程
   */
  static async getUserCourses(userId: string) {
    return prisma.course.findMany({
      where: { userId },
      include: {
        chapters: {
          include: {
            lessons: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 创建课程
   */
  static async createCourse(data: {
    title: string;
    description?: string;
    coverImageUrl?: string;
    isPublic: boolean;
    userId: string;
  }) {
    return prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        isPublic: data.isPublic,
        userId: data.userId,
      }
    });
  }

  /**
   * 更新课程（包含权限校验）
   */
  static async updateCourse(courseId: string, data: Partial<{
    title: string;
    description: string;
    coverImageUrl: string;
    isPublic: boolean;
  }>, userId?: string) {
    // 权限校验
    if (!await canEditCourse(courseId, userId)) {
      throw new Error('无权编辑此课程');
    }

    return prisma.course.update({
      where: { id: courseId },
      data
    });
  }

  /**
   * 删除课程（包含权限校验）
   */
  static async deleteCourse(courseId: string, userId?: string) {
    // 权限校验
    if (!await canEditCourse(courseId, userId)) {
      throw new Error('无权删除此课程');
    }

    return prisma.course.delete({
      where: { id: courseId }
    });
  }

  /**
   * 检查用户是否是课程作者
   */
  static async isCourseOwner(courseId: string, userId?: string): Promise<boolean> {
    return canEditCourse(courseId, userId);
  }

  /**
   * 获取课程的第一个小节ID（用于"开始学习"按钮）
   */
  static async getFirstLessonId(courseId: string, userId?: string): Promise<string | null> {
    // 权限校验
    if (!await canViewCourse(courseId, userId)) {
      return null;
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
              take: 1
            }
          }
        }
      }
    });

    if (!course) return null;

    // 查找第一个有小节的章节
    for (const chapter of course.chapters) {
      if (chapter.lessons.length > 0) {
        return chapter.lessons[0].id;
      }
    }

    return null;
  }
}