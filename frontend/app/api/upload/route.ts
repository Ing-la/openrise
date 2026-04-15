import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile, generateKey, initializeBucket, deleteFile } from "@/lib/s3";

export async function POST(request: Request) {
  let type = "avatar"; // 默认值，在catch块中也可访问
  try {
    // 懒初始化MinIO存储桶
    await initializeBucket();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    type = (formData.get("type") as string) || "avatar"; // avatar | cover | pdf | image

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPG、PNG、WebP 或 PDF 格式" },
        { status: 400 }
      );
    }

    // 根据文件类型设置不同的大小限制
    let maxSize: number;
    let errorMessage: string;
    if (file.type === "application/pdf") {
      maxSize = 50 * 1024 * 1024; // PDF: 50MB
      errorMessage = "PDF文件大小不超过50MB";
    } else if (file.type.startsWith("image/")) {
      maxSize = 20 * 1024 * 1024; // 图片: 20MB
      errorMessage = "图片文件大小不超过20MB";
    } else {
      maxSize = 2 * 1024 * 1024; // 其他: 2MB
      errorMessage = "文件大小不超过2MB";
    }
    if (file.size > maxSize) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 生成存储键并上传到MinIO
    console.log("开始上传文件:", {
      userId: session.user.id,
      type,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    const key = generateKey(type as "avatar" | "cover" | "pdf" | "image", session.user.id, file.name);
    console.log("生成的S3 key:", key);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("调用uploadFile，key:", key, "contentType:", file.type);
    const url = await uploadFile(buffer, key, file.type);
    console.log("上传成功，返回URL:", url);

    return NextResponse.json({ url });
  } catch (e) {
    console.error("Upload error:", e);
    // 提供更详细的错误信息用于调试
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Upload error details:", {
      error: errorMessage,
      type,
      minioEndpoint: process.env.MINIO_ENDPOINT,
      minioBucket: process.env.MINIO_BUCKET
    });
    return NextResponse.json(
      { error: `上传失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "缺少文件key参数" }, { status: 400 });
    }

    // 验证文件所有权：key格式为 type/userId-timestamp-random.ext
    // 提取userId部分（key中第一个-之前的部分，在type/之后）
    const parts = key.split('/');
    if (parts.length !== 2) {
      return NextResponse.json({ error: "无效的文件key格式" }, { status: 400 });
    }
    const filename = parts[1];
    const userIdFromKey = filename.split('-')[0];

    if (userIdFromKey !== session.user.id) {
      return NextResponse.json({ error: "无权删除此文件" }, { status: 403 });
    }

    await deleteFile(key);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete file error:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `删除失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
