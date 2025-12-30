import Image from "next/image";
import { FeaturedProfiles } from "../components/FeaturedProfiles";

export default function HomePage() {
  return (
    <div className="relative min-h-screen pb-16">
      {/* Warped mesh grid (Option A) */}
      <div
        className="
          pointer-events-none absolute inset-0 -z-10 opacity-70
          [background:
            radial-gradient(120%_60%_at_50%_0%,rgba(255,255,255,0.10),transparent),
	    linear-gradient(rgba(148,163,184,0.35)_1px,transparent_1px),
            linear-gradient(to_right,rgba(148,163,184,0.28)_1px,transparent_1px)
          ]
          [background-size:
            100%_100%,
            26px_26px,
            26px_26px
          ]
          [mask-image:radial-gradient(circle_at_center,rgba(0,0,0,1),rgba(0,0,0,0.15))]
        "
      />
      {/* subtle background glow on the right */}
      <div className="pointer-events-none fixed inset-y-0 right-[-120px] w-[380px] bg-gradient-radial from-vampAccent/20 via-transparent to-transparent blur-3xl opacity-70" />
      {/* subtle background glow on the left */}
      <div className="pointer-events-none fixed inset-y-0 left-[-160px] w-[420px] bg-gradient-radial from-vampAccent/15 via-transparent to-transparent blur-3xl opacity-60" />

      {/* VampCat hero accent */}
      {/* <div className="pointer-events-none absolute top-24 right-[-120px] z-0 hidden lg:block">
        <Image
          src="/vampcat_avatar.png"
          alt="VampCat mascot"
          width={420}
          height={420}
          priority
          className="opacity-90 drop-shadow-[0_0_40px_rgba(239,68,68,0.25)] mask-image-radial"
        />
      </div> */}

      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-16 space-y-12">
        {/* Early preview badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-vampSurfaceSoft/80 border border-vampBorder px-3 py-1 text-[11px] text-vampTextMuted">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/30 text-[9px]">
            ●
          </span>
          <span className="font-medium text-vampTextMain/90">
            Early preview
          </span>
          <span>· Human-verified Web3 professionals</span>
        </div>

        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
          {/* Left: copy & CTAs */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
              <span className="block">
                Find builders you{" "}
                <span className="text-vampAccent">trust</span>
              </span>
              <span className="block text-white">
                — verified by the VampCatCoin community.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-vampTextMuted max-w-xl">
              VampCatCoin Verification is building a curated directory of developers,
              marketers, market makers, moderators and Web3 workers. Every
              profile is reviewed by humans and backed by on-chain history and
              references.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/directory"
                className="cursor-paw-pointer inline-flex items-center justify-center rounded-full bg-vampAccent px-5 py-2.5 text-sm font-medium text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
              >
                Browse directory
              </a>
              <a
                href="/apply"
                className="cursor-paw-pointer inline-flex items-center justify-center rounded-full bg-white/5 px-5 py-2.5 text-sm font-medium text-vampTextMain hover:bg-white/10 border border-vampBorder"
              >
                Apply to get verified
              </a>
            </div>

            <p className="text-[12px] text-vampTextMuted">
              Manual vetting · References required · On-chain history
            </p>
          </div>

          {/* Right: sample preview card */}
          <div className="hidden md:block">
            <div className="accent-border max-w-md ml-auto">
              <div className="bg-[#0A0B0E]/95 border border-vampBorder rounded-2xl px-5 py-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-vampTextMuted">
                  <span className="font-medium text-vampTextMain">
                    Sample of what your live directory will look like:
                  </span>
                  <span>Demo data · For preview only</span>
                </div>

                <div className="space-y-3 text-[12px]">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-vampTextMuted">
                        Top Verified
                      </div>
                      <div className="font-semibold text-vampTextMain">
                        Astra Labs
                      </div>
                      <div className="text-vampTextMuted/80">
                        Developer · Solana, bots, token contracts
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                      Verified by VampCatCoin
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-vampTextMain">
                        Nova Flow MM
                      </div>
                      <div className="text-vampTextMuted/80">
                        Market Maker · Liquidity strategy
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                      Verified by VampCatCoin
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-vampTextMain">
                        Luna Signal
                      </div>
                      <div className="text-vampTextMuted/80">
                        Marketer · Spaces & influencer campaigns
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] bg-amber-500/15 text-amber-300 border border-amber-400/40">
                      Pending review
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-vampTextMuted pt-1">
                  This preview shows the type of trusted service directory VampCatCoin
                  can become — a “who to trust” list for new projects.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live directory section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recently approved profiles.
              </h2>
              <p className="text-[12px] text-vampTextMuted">
                Search by name, wallet, role, or tags. This is early demo data
                to show how verification could look.
              </p>
            </div>
          </div>

          <FeaturedProfiles />
        </section>
      </main>
    </div>
  );
}

