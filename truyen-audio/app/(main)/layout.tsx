import Header from "@/components/layout/Header";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <GlobalAudioPlayer />
    </>
  );
}
