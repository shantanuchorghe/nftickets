"use client";
import { useState } from "react";
import { Calendar, Ticket } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

interface EventCardProps {
  id: string;
  name: string;
  date: string;
  image: string;
}

export function EventCard({ id, name, date, image }: EventCardProps) {
  const { connected, publicKey } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const handleMint = async () => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsMinting(true);
    setMessage("");

    try {
      const response = await fetch("/api/mint-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: id,
          buyerWallet: publicKey.toBase58(),
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        mintAddress?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Mint request failed.");
      }

      setMinted(true);
      setMessage(
        payload.mintAddress
          ? `Ticket minted: ${payload.mintAddress.slice(0, 6)}...${payload.mintAddress.slice(-6)}`
          : "Ticket minted successfully.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Minting failed.",
      );
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="bg-[#18181b] rounded-xl overflow-hidden border border-[#27272a]/40 shadow-lg hover:border-[#27272a] transition-colors">
      <div className="h-48 w-full bg-indigo-950 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent z-10" />
        {!imageError && image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-200/50 font-semibold tracking-wider uppercase px-4 text-center">
            {name}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-4 relative z-20">
        <div>
          <h3 className="font-semibold text-xl text-white mb-2">{name}</h3>
          <div className="flex items-center text-sm text-zinc-400 gap-2">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
        </div>

        <button
          onClick={handleMint}
          disabled={isMinting || minted}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          <Ticket className="w-4 h-4" />
          {isMinting ? "Minting..." : minted ? "Ticket Minted!" : "Mint Ticket"}
        </button>
        {message && (
          <p className={`text-xs ${minted ? "text-emerald-400" : "text-zinc-400"}`}>{message}</p>
        )}
      </div>
    </div>
  );
}
