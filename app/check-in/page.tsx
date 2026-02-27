"use client";
import { useState } from "react";
import { ScanLine, CheckCircle2, XCircle } from "lucide-react";
import { checkInTicket } from "@/lib/tickets";

export default function CheckInPage() {
  const [mintAddress, setMintAddress] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "valid" | "used" | "invalid" | "notfound" | "mint_gone"
  >("idle");

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintAddress) return;

    setStatus("checking");

    // Verify on Solana + update checked_in in Supabase.
    let result: Awaited<ReturnType<typeof checkInTicket>>;

    try {
      result = await checkInTicket(mintAddress.trim());
    } catch {
      setStatus("invalid");
      return;
    }

    if (result.ok) {
      setStatus("valid");
      return;
    }

    if (result.code === "already_used") {
      setStatus("used");
      return;
    }

    if (result.code === "mint_not_found") {
      setStatus("mint_gone");
      return;
    }

    if (result.code === "invalid_owner") {
      setStatus("invalid");
      return;
    }

    setStatus("notfound");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20 shadow-[0_0_30px_-5px_var(--color-indigo-500)]">
          <ScanLine className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Ticket Scanner</h1>
        <p className="text-zinc-400">Enter mint address to verify entry.</p>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleCheckIn} className="space-y-4">
          <div>
            <label htmlFor="mintAddress" className="block text-sm font-medium text-zinc-400 mb-2">
              Mint Address
            </label>
            <input
              id="mintAddress"
              type="text"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              placeholder="e.g. 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={status === "checking" || !mintAddress}
            className="w-full bg-white text-black font-semibold rounded-lg px-4 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {status === "checking" ? "Verifying..." : "Check In Attendee"}
          </button>
        </form>

        {status === "valid" && (
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3 text-emerald-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-400">Valid Ticket</p>
              <p className="text-sm mt-1 text-emerald-400/80">Ticket verified successfully. Access granted.</p>
            </div>
          </div>
        )}

        {status === "invalid" && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3 text-rose-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-rose-400">Ownership Failed</p>
              <p className="text-sm mt-1 text-rose-400/80">
                Wallet on record no longer owns this mint on Solana Devnet.
              </p>
            </div>
          </div>
        )}

        {status === "mint_gone" && (
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3 text-amber-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-400">Mint No Longer Exists</p>
              <p className="text-sm mt-1 text-amber-400/80">
                The NFT mint was wiped from Solana Devnet (likely a network reset). The ticket must be re‑minted.
              </p>
            </div>
          </div>
        )}

        {status === "notfound" && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3 text-rose-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-rose-400">Ticket Not Found</p>
              <p className="text-sm mt-1 text-rose-400/80">
                No ticket record exists for this mint address.
              </p>
            </div>
          </div>
        )}

        {status === "used" && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3 text-rose-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-rose-400">Already Used</p>
              <p className="text-sm mt-1 text-rose-400/80">This ticket has already been checked in.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
