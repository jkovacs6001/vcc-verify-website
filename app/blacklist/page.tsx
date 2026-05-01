import { prisma } from "@/lib/db";
import { BlacklistSearch } from "@/components/BlacklistSearch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlacklistPage() {
  const entries = await prisma.blacklistedWallet.findMany({
    orderBy: { confirmedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Wallet Blacklist</h1>
        <p className="mt-2 text-vampTextMuted text-sm">
          Confirmed scammer wallets verified by the VCC team. Search by wallet address to
          check if an address has been flagged.
        </p>
      </div>

      <BlacklistSearch entries={entries} />
    </div>
  );
}
