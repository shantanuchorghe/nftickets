"use client";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function Home() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
          NFTickets
        </h1>
        <p className="text-xl text-zinc-400 max-w-xl mx-auto">
          Mint and verify NFT event tickets seamlessly on the Solana blockchain.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 w-full max-w-md mx-auto">
        {!connected ? (
          <button
            onClick={() => setVisible(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
          >
            Connect Wallet
          </button>
        ) : (
          <Link
            href="/events"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 text-center"
          >
            Go to Events
          </Link>
        )}
        <Link
          href="/events"
          className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white font-semibold rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-colors text-center"
        >
          View All Events
        </Link>
      </div>
    </div>
  );
}
