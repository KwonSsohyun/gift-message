import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center px-5 py-3.5">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          위시리스트
        </Link>
      </div>
    </header>
  );
}
