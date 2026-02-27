"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton,
    ),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        className="wallet-adapter-button wallet-adapter-button-trigger"
        style={{ backgroundColor: "#27272a", height: "36px", borderRadius: "8px" }}
        disabled
      >
        Select Wallet
      </button>
    ),
  },
);

export function Navbar() {
  return (
    <nav className="border-b border-[#27272a]/20 bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full px-2 sm:px-4 lg:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            NFTickets
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/events" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            Events
          </Link>
          <Link href="/my-ticket" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            My Tickets
          </Link>
          <Link href="/check-in" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            Check-In
          </Link>
          <div className="flex-shrink-0">
            <WalletMultiButton style={{ backgroundColor: "#27272a", height: "36px", borderRadius: "8px" }} />
          </div>
        </div>
      </div>
    </nav>
  );
}
