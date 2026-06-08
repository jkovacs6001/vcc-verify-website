import { prisma } from "@/lib/db";
import { BlacklistSearch } from "@/components/BlacklistSearch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlacklistPage() {
  const [wallets, confirmedProjects, confirmedTwitter] = await Promise.all([
    prisma.blacklistedWallet.findMany({ orderBy: { confirmedAt: "desc" } }),
    prisma.scamReport.findMany({
      where: { status: "CONFIRMED", reportType: "project" },
      orderBy: { reviewedAt: "desc" },
    }),
    prisma.scamReport.findMany({
      where: { status: "CONFIRMED", reportType: "twitter" },
      orderBy: { reviewedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Blacklist</h1>
        <p className="mt-2 text-vampTextMuted text-sm">
          Confirmed scam wallets, projects, and X/Twitter accounts verified by the VCC team.
          Search by address, handle, or project name to check if it has been flagged.
        </p>
      </div>

      <BlacklistSearch
        wallets={wallets}
        projects={confirmedProjects}
        twitterAccounts={confirmedTwitter}
      />
    </div>
  );
}
