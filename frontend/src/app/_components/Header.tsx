"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();

  const navigation = [
    { name: "Prompt", href: "/", icon: "💬" },
    // { name: "Audio", href: "/audio", icon: "🎤" },
    { name: "Import CSV", href: "/OnBoarding", icon: "📊" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="SupplAIChain Logo"
                  width={100}
                  height={100}
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-slate-800">SupplAI Chain Control Tower</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1 w-1/3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side info */}
          <div className="flex items-center space-x-3">
            <div className="hidden text-xs text-slate-500 sm:block">
              RAISE Hackathon 2025
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
              <span className="text-xs font-semibold text-slate-600">V</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}