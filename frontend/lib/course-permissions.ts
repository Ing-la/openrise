import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import { authOptions } from "./auth";

/**
 * 检查用户是否可以查看课程
 * @param courseId 课程ID
 * @param userId 可选的用户ID（如果未提供，则从会话中获取）
 * @returns 是否可以查看
 */
export async function canViewCourse(courseId: string, userId?: string): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { isPublic: true, userId: true }
  });

  if (!course) return false;

  // 公开课程任何人都可以查看
  if (course.isPublic) return true;

  // 私有课程需要用户ID
  let currentUserId = userId;
  if (!currentUserId) {
    const session = await getServerSession(authOptions);
    currentUserId = session?.user?.id;
  }

  if (!currentUserId) return false;

  // 私有课程仅作者可查看
  return course.userId === currentUserId;
}

/**
 * 检查用户是否可以编辑课程（必须是课程作者）
 * @param courseId 课程ID
 * @param userId 可选的用户ID（如果未提供，则从会话中获取）
 * @returns 是否可以编辑
 */
export async function canEditCourse(courseId: string, userId?: string): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { userId: true }
  });

  if (!course) return false;

  let currentUserId = userId;
  if (!currentUserId) {
    const session = await getServerSession(authOptions);
    currentUserId = session?.user?.id;
  }

  if (!currentUserId) return false;

  return course.userId === currentUserId;
}

/**
 * 检查用户是否可以查看小节（继承课程的权限）
 * @param lessonId 小节ID
 * @param userId 可选的用户ID
 * @returns 是否可以查看
 */
export async function canViewLesson(lessonId: string, userId?: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        include: {
          course: {
            select: { isPublic: true, userId: true }
          }
        }
      }
    }
  });

  if (!lesson) return false;

  const course = lesson.chapter.course;

  // 获取当前用户ID
  let currentUserId = userId;
  if (!currentUserId) {
    const session = await getServerSession(authOptions);
    currentUserId = session?.user?.id;
  }

  // 如果是课程作者，可以查看所有小节（无论课程或小节的公开状态）
  if (currentUserId && course.userId === currentUserId) {
    return true;
  }

  // 课程私有：只有作者能查看（上面已检查）
  if (!course.isPublic) {
    return false;
  }

  // 课程公开，但小节私有：只有作者能查看（上面已检查）
  if (!lesson.isPublic) {
    return false;
  }

  // 课程公开且小节公开：所有人都能查看
  return true;
}

/**
 * 检查用户是否可以编辑小节（必须是课程作者）
 * @param lessonId 小节ID
 * @param userId 可选的用户ID
 * @returns 是否可以编辑
 */
export async function canEditLesson(lessonId: string, userId?: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        include: {
          course: {
            select: { userId: true }
          }
        }
      }
    }
  });

  if (!lesson) return false;

  let currentUserId = userId;
  if (!currentUserId) {
    const session = await getServerSession(authOptions);
    currentUserId = session?.user?.id;
  }

  if (!currentUserId) return false;

  return lesson.chapter.course.userId === currentUserId;
}

/**
 * 获取用户可以查看的课程列表
 * @param userId 可选的用户ID
 * @returns 课程列表
 */
export async function getViewableCourses(userId?: string) {
  let currentUserId = userId;
  if (!currentUserId) {
    const session = await getServerSession(authOptions);
    currentUserId = session?.user?.id;
  }

  if (currentUserId) {
    // 登录用户：可以查看公开课程 + 自己创建的私有课程
    return prisma.course.findMany({
      where: {
        OR: [
          { isPublic: true },
          { userId: currentUserId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  } else {
    // 未登录用户：只能查看公开课程
    return prisma.course.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}

/**
 * 获取用户创建的课程（用于管理界面）
 * @param userId 用户ID
 * @returns 用户创建的课程列表
 */
export async function getUserCourses(userId: string) {
  return prisma.course.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}