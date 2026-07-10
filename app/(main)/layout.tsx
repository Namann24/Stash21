import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import PageTransition from "@/components/PageTransition";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="main-content min-h-screen relative z-10 pt-20">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
