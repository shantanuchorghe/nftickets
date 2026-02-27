"use client";

import { useState } from "react";
import { CalendarDays, Copy, Check } from "lucide-react";

interface TicketCardProps {
  eventName: string;
  walletAddress: string;
  mintAddress: string;
  date: string;
  checkedIn: boolean;
}

export function TicketCard({
  eventName,
  walletAddress,
  mintAddress,
  date,
  checkedIn,
}: TicketCardProps) {
  const qrValue = encodeURIComponent(mintAddress);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mintAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: select a hidden input — ignored for simplicity
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-gradient-to-b from-[#18181b] to-[#09090b] rounded-2xl border border-[#27272a] shadow-2xl relative">
      <div className="p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">{eventName}</h2>
        <div className="flex items-center gap-2 text-zinc-400 mb-8">
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <span className="text-sm">{date}</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-inner mb-8">
          {/* Quick QR code image so scanners can read the mint address. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrValue}`}
            alt="Ticket QR"
            className="w-32 h-32"
          />
        </div>

        <div className="w-full space-y-3 pt-6 border-t border-dashed border-[#27272a]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 font-medium">Owner</span>
            <span className="text-zinc-300 font-mono truncate max-w-[150px]">
              {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 font-medium">Mint</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-zinc-300 font-mono hover:text-indigo-400 transition-colors group cursor-pointer"
              title="Copy mint address"
            >
              <span className="truncate max-w-[150px]">
                {mintAddress.slice(0, 6)}...{mintAddress.slice(-6)}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
              )}
              {copied && (
                <span className="text-xs text-emerald-400 font-sans">Copied!</span>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 font-medium">Check-In</span>
            <span className={checkedIn ? "text-emerald-400 font-medium" : "text-zinc-300"}>
              {checkedIn ? "Used" : "Not used"}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket cutouts */}
      <div className="absolute top-[65%] -left-4 w-8 h-8 bg-[#09090b] rounded-full border-r border-[#27272a]" />
      <div className="absolute top-[65%] -right-4 w-8 h-8 bg-[#09090b] rounded-full border-l border-[#27272a]" />
    </div>
  );
}
