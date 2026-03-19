import Image from "next/image";
import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-6 md:px-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-gray-200/90 shadow-sm">
            <Image
              src="/images/logo.jpg"
              alt="OpenRise"
              width={42}
              height={42}
              className="rounded-lg"
            />
          </div>
          <h2 className="text-xl font-bold uppercase leading-tight tracking-tight text-primary">
            OpenRise
          </h2>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <span className="material-symbols-outlined text-4xl">mail</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            请查收验证邮件
          </h1>
          <p className="mb-8 text-slate-600">
            我们已向你的邮箱发送了验证链接，请点击链接完成注册。链接 24 小时内有效。
          </p>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
          >
            前往登录
          </Link>
        </div>
      </main>
    </div>
  );
}
