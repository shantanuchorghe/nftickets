import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { supabase } from "@/lib/supabase";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);

type CreateEventInput = {
  name: string;
  description: string;
  date: string;
  price: number;
  total_supply: number;
};

type SaveTicketInput = {
  mint_address: string;
  event_id: string;
  owner_wallet: string;
};

export type UserTicket = {
  id: string;
  mint_address: string;
  owner_wallet: string;
  checked_in: boolean;
  created_at: string;
  events: {
    id: string;
    name: string;
    description: string;
    date: string;
    price: number;
    total_supply: number;
  } | null;
};

type UserTicketRow = Omit<UserTicket, "events"> & {
  events:
    | Array<{
        id: string;
        name: string;
        description: string;
        date: string;
        price: number;
        total_supply: number;
      }>
    | null;
};

export async function createEvent(input: CreateEventInput) {
  const { data, error } = await supabase
    .from("events")
    .insert(input)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function saveTicket(input: SaveTicketInput) {
  const { data, error } = await supabase
    .from("tickets")
    .insert(input)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserTickets(ownerWallet: string): Promise<UserTicket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select(
      "id, mint_address, owner_wallet, checked_in, created_at, events(id, name, description, date, price, total_supply)",
    )
    .eq("owner_wallet", ownerWallet)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = ((data ?? []) as unknown[]) as UserTicketRow[];
  return rows.map((row) => ({
    ...row,
    events: row.events?.[0] ?? null,
  }));
}

const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);

/**
 * Checks whether the mint account exists on‑chain.
 * Returns false when devnet has been reset and the account is wiped.
 */
async function mintExistsOnChain(mintAddress: string): Promise<boolean> {
  try {
    const info = await connection.getAccountInfo(new PublicKey(mintAddress));
    return info !== null;
  } catch {
    return false;
  }
}

async function verifyMintOwnership(
  mintAddress: string,
  ownerWallet: string,
): Promise<boolean> {
  const ownerPublicKey = new PublicKey(ownerWallet);

  // Check both SPL Token (legacy) and Token‑2022 programs
  for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        ownerPublicKey,
        { programId },
      );

      const owns = tokenAccounts.value.some(({ account }) => {
        const parsed = account.data.parsed as {
          info?: { mint?: string; tokenAmount?: { amount?: string } };
        };
        const mint = parsed?.info?.mint;
        const rawAmount = parsed?.info?.tokenAmount?.amount ?? "0";
        return mint === mintAddress && Number(rawAmount) > 0;
      });

      if (owns) return true;
    } catch {
      // continue to next program
    }
  }

  return false;
}

export async function checkInTicket(mintAddress: string) {
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id, mint_address, owner_wallet, checked_in")
    .eq("mint_address", mintAddress)
    .single();

  if (error || !ticket) {
    return { ok: false as const, code: "not_found" as const };
  }

  if (ticket.checked_in) {
    return { ok: false as const, code: "already_used" as const };
  }

  // First: does the mint even exist on‑chain? (catches devnet resets)
  const mintExists = await mintExistsOnChain(ticket.mint_address);
  if (!mintExists) {
    return { ok: false as const, code: "mint_not_found" as const };
  }

  const isOwnerValid = await verifyMintOwnership(
    ticket.mint_address,
    ticket.owner_wallet,
  );

  if (!isOwnerValid) {
    return { ok: false as const, code: "invalid_owner" as const };
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update({ checked_in: true })
    .eq("id", ticket.id);

  if (updateError) throw new Error(updateError.message);
  return { ok: true as const, code: "checked_in" as const };
}
