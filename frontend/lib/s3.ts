import { S3Client, PutObjectCommand, DeleteObjectCommand, ListBucketsCommand, CreateBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";

// 从环境变量获取MinIO配置
const endpoint = process.env.MINIO_ENDPOINT || "http://minio:9000";
const accessKeyId = process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "minioadmin";
const secretAccessKey = process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minioadmin";
const bucket = process.env.MINIO_BUCKET || "uploads";
const region = process.env.MINIO_REGION || "";
const useSSL = process.env.MINIO_USE_SSL === "true";

// 创建S3客户端实例（针对MinIO配置）
export const s3Client = new S3Client({
  endpoint,
  region: region || "us-east-1", // MinIO需要区域，默认为us-east-1
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // MinIO需要path-style URL
  tls: useSSL,
  ...(useSSL ? {} : { requestHandler: { http: require("http") } }), // 禁用SSL时使用http
});

/**
 * 上传文件到MinIO
 * @param buffer 文件Buffer
 * @param key 存储键（路径+文件名）
 * @param contentType 文件类型
 * @returns 公开访问的URL
 */
export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  console.log("S3上传参数:", {
    bucket,
    key,
    contentType,
    bufferSize: buffer.length,
    endpoint,
    useSSL
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // 设置公开访问
    ACL: "public-read",
  });

  try {
    const response = await s3Client.send(command);
    console.log("S3上传成功，响应:", {
      statusCode: response.$metadata.httpStatusCode,
      requestId: response.$metadata.requestId,
      cfId: response.$metadata.cfId
    });
  } catch (error) {
    console.error("S3上传失败:", error);
    throw error;
  }

  // MinIO公共URL格式：http://minio:9000/bucket/key
  // 前端通过nginx代理访问：/uploads/key（nginx会添加bucket前缀）
  // 使用相对路径，让nginx正确处理代理
  const url = `/uploads/${key}`;
  console.log("返回URL:", url);
  return url;
}

/**
 * 删除MinIO中的文件
 * @param key 存储键
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * 生成存储键（路径+文件名）
 * @param type 文件类型：avatar | cover | pdf | image
 * @param userId 用户ID
 * @param originalName 原始文件名（用于提取扩展名）
 * @returns 存储键
 */
export function generateKey(
  type: "avatar" | "cover" | "pdf" | "image",
  userId: string,
  originalName: string
): string {
  // PDF使用固定扩展名.pdf，确保正确Content-Type
  const ext = type === "pdf" ? "pdf" : originalName.split(".").pop() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}/${userId}-${timestamp}-${random}.${ext}`;
}

/**
 * 检查MinIO连接是否正常
 */
export async function testConnection(): Promise<boolean> {
  try {
    // 简单尝试列出bucket（需要ListBucket权限）
    // 或者尝试创建一个小对象并删除
    const testKey = `test-connection-${Date.now()}.txt`;
    await uploadFile(Buffer.from("test"), testKey, "text/plain");
    await deleteFile(testKey);
    return true;
  } catch (error) {
    console.error("MinIO连接测试失败:", error);
    return false;
  }
}

/**
 * 初始化MinIO存储桶（如果不存在则创建）
 */
export async function initializeBucket(): Promise<void> {
  try {
    // 检查bucket是否存在
    const listCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listCommand);
    const bucketExists = buckets.Buckets?.some((b: any) => b.Name === bucket) || false;

    if (!bucketExists) {
      console.log(`创建MinIO存储桶: ${bucket}`);
      const createCommand = new CreateBucketCommand({
        Bucket: bucket,
      });
      await s3Client.send(createCommand);
      console.log(`存储桶 ${bucket} 创建成功`);
    } else {
      console.log(`存储桶 ${bucket} 已存在`);
    }

    // 设置存储桶策略为公开读取
    await setBucketPublicPolicy();
  } catch (error) {
    console.error("初始化MinIO存储桶失败:", error);
    // 不阻止应用启动，上传时可能会失败
  }
}

/**
 * 设置存储桶策略为公开读取
 */
async function setBucketPublicPolicy(): Promise<void> {
  try {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };

    const policyCommand = new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify(policy),
    });

    await s3Client.send(policyCommand);
    console.log(`存储桶 ${bucket} 策略设置为公开读取`);
  } catch (error) {
    console.error("设置存储桶策略失败:", error);
    // 不阻止应用，上传时使用ACL: "public-read"也能工作
  }
}