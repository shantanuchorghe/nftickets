import "server-only";

import { NextResponse } from "next/server";
import { Metaplex, irysStorage, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import bs58 from "bs58";

const privateKey = process.env.ADMIN_PRIVATE_KEY;

if (!privateKey) {
  throw new Error("ADMIN_PRIVATE_KEY is not set");
}

const secretKey = bs58.decode(privateKey);

export const runtime = "nodejs";

type MintTicketRequestBody = {
  eventId?: string;
  buyerWallet?: string;
};

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

function getAdminKeypair(): Keypair {
  return Keypair.fromSecretKey(secretKey);
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(req: Request) {
  try {
    let body: MintTicketRequestBody;

    try {
      body = (await req.json()) as MintTicketRequestBody;
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const eventId = body.eventId?.trim();
    const buyerWalletRaw = body.buyerWallet?.trim();

    if (!eventId) return badRequest("eventId is required.");
    if (!buyerWalletRaw) return badRequest("buyerWallet is required.");

    let buyerPublicKey: PublicKey;
    try {
      buyerPublicKey = new PublicKey(buyerWalletRaw);
    } catch {
      return badRequest("buyerWallet must be a valid Solana public key.");
    }

    const supabase = getSupabaseAdminClient();

    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("id, name")
      .eq("id", eventId)
      .single();

    if (eventError || !eventData) {
      return badRequest("Invalid eventId.");
    }

    const eventName = eventData.name;

    console.log("Connecting to Solana Devnet...");
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const adminKeypair = getAdminKeypair();

    console.log("Initializing Metaplex...");
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(adminKeypair))
      .use(irysStorage({
        address: 'https://devnet.irys.xyz',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      }));

    const metadata = {
      name: `${eventName} Ticket`,
      symbol: "TIX",
      description: `Event: ${eventName}`,
      attributes: [
        { trait_type: "Event", value: eventName },
      ],
    };

    console.log("Uploading metadata to Irys (Arweave)...");
    const { uri } = await metaplex.nfts().uploadMetadata(metadata);
    console.log("Metadata uploaded successfully. URI:", uri);

    console.log("Minting NFT on-chain...");
    const { nft } = await metaplex.nfts().create({
      uri,
      name: metadata.name,
      symbol: metadata.symbol,
      sellerFeeBasisPoints: 0,
      tokenOwner: buyerPublicKey,
    });
    console.log("NFT minted successfully! Address:", nft.address.toBase58());

    const mintAddress = nft.address.toBase58();

    const { error: insertError } = await supabase.from("tickets").insert({
      event_id: eventId,
      mint_address: mintAddress,
      owner_wallet: buyerPublicKey.toBase58(),
      checked_in: false,
    });

    if (insertError) {
      throw new Error(`Failed to save ticket in Supabase: ${insertError.message}`);
    }

    return NextResponse.json({ success: true, mintAddress });
  } catch (error) {
    console.error("mint-ticket route error:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
