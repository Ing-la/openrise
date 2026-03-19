/**
 * 解析 B站 / YouTube 链接，返回嵌入用 URL
 */
export function parseVideoUrl(url: string): { platform: string; embedUrl: string } | null {
  const trimmed = url.trim();

  // B站: https://www.bilibili.com/video/BV1xx411c7mD/
  const bilibiliMatch = trimmed.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (bilibiliMatch) {
    return {
      platform: "bilibili",
      embedUrl: `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}&high_quality=1`,
    };
  }

  // YouTube: https://www.youtube.com/watch?v=VIDEO_ID 或 https://youtu.be/VIDEO_ID
  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
  );
  if (youtubeMatch) {
    return {
      platform: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  return null;
}

export function detectPlatform(url: string): "bilibili" | "youtube" | null {
  const result = parseVideoUrl(url);
  return result?.platform as "bilibili" | "youtube" | null;
}
