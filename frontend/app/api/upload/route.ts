import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile, generateKey, initializeBucket } from "@/lib/s3";

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
    type = (formData.get("type") as string) || "avatar"; // avatar | cover

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPG、PNG、WebP 格式" },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不超过 2MB" }, { status: 400 });
    }

    // 生成存储键并上传到MinIO
    console.log("开始上传文件:", {
      userId: session.user.id,
      type,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    const key = generateKey(type as "avatar" | "cover", session.user.id, file.name);
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
