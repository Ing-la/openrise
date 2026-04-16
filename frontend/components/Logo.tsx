import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
  /** Header 位置使用，带灰色描边和圆角 */
  variant?: "header" | "default";
}

export default function Logo({
  className = "",
  size = 48,
  variant = "default",
}: LogoProps) {
  const img = (
    <Image
      src="/images/logo.jpg"
      alt="零壹"
      width={size}
      height={size}
      className={`shrink-0 rounded-lg ${className}`}
      priority
    />
  );

  if (variant === "header") {
    return (
      <div className="flex shrink-0 items-center justify-center rounded-xl border border-gray-200/90 shadow-sm">
        {img}
      </div>
    );
  }

  return img;
}
