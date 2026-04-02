import { prisma } from "@/lib/prisma";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  let bgImage = "";
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    bgImage = settings?.heroBackground || "";
  } catch { /* ignore */ }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Background */}
      {bgImage ? (
        <>
          <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f0f23]" />
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🎧</span>
            <span className="text-2xl font-bold text-white">TruyệnAudio</span>
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
