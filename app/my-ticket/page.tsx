"use client";
import { useEffect, useState } from "react";
import { TicketCard } from "@/components/TicketCard";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getUserTickets, UserTicket } from "@/lib/tickets";

export default function MyTicketPage() {
  const { publicKey, connected } = useWallet();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!publicKey) return;
      setLoading(true);
      try {
        const data = await getUserTickets(publicKey.toString());
        setTickets(data);
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [publicKey]);

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-6">Connect to view your tickets</h2>
        <div className="flex justify-center flex-col items-center">
          <p className="text-zinc-400 mb-8 max-w-sm">Please connect your Solana wallet to view all the NFT tickets you have minted.</p>
          <WalletMultiButton style={{ backgroundColor: "#27272a", borderRadius: "8px" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Your Tickets</h1>
        <p className="text-zinc-400">Manage and view your minted NFT tickets.</p>
      </div>

      <div className="mt-8">
        {loading && <p className="text-zinc-400 text-center">Loading your tickets...</p>}
        {!loading && tickets.length === 0 && (
          <p className="text-zinc-400 text-center">No tickets found for this wallet yet.</p>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              eventName={ticket.events?.name ?? "Unknown Event"}
              walletAddress={ticket.owner_wallet}
              mintAddress={ticket.mint_address}
              date={ticket.events?.date ? new Date(ticket.events.date).toLocaleString() : "-"}
              checkedIn={ticket.checked_in}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
