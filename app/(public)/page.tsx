import Link from "next/link";
import Image from "next/image";

export default function PublicHomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center font-sans bg-gray-50 text-black p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <main className="flex flex-col items-center justify-center text-center max-w-xl space-y-8 bg-white border border-gray-200 p-10 rounded-3xl shadow-xl z-10">
        <div className="relative w-24 h-24 rounded-2xl bg-black p-1 border border-black transition-transform hover:scale-105 duration-300 flex items-center justify-center shadow-md">
          <Image
            src="/Logo.svg"
            alt="Thender Logo"
            width={80}
            height={80}
            className="rounded-xl object-contain invert"
            priority
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tight text-black">
            THENDER
          </h1>
          <p className="text-orange-500 font-black tracking-widest uppercase text-xs">
            Social Media Platform
          </p>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
            Catch the spark of connection. Share moments, find your people, and stay in touch on the simplest next-gen platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2">
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-xl bg-black px-8 font-bold tracking-wide text-white transition-all hover:bg-gray-900 shadow-md active:scale-[0.98] sm:flex-1 cursor-pointer"
          >
            Join us
          </Link>
          
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl border-2 border-black bg-transparent px-8 font-bold tracking-wide text-black transition-all hover:bg-black hover:text-white active:scale-[0.98] sm:flex-1 cursor-pointer"
          >
            Log in
          </Link>
        </div>

      </main>

      <footer className="absolute bottom-4 text-xs font-bold text-gray-400 tracking-widest uppercase">
        © {new Date().getFullYear()} THENDER CORP. ALL RIGHTS RESERVED. May be)
      </footer>
    </div>
  );
}