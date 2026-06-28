import TrustWeb from '@/components/TrustWeb';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return (
    <div className="relative w-full overflow-hidden pb-16">
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
      <div className="pointer-events-none fixed inset-y-0 right-0 w-[300px] bg-gradient-radial from-blistAccent/20 via-transparent to-transparent blur-3xl opacity-70" />
      {/* subtle background glow on the left */}
      <div className="pointer-events-none fixed inset-y-0 left-0 w-[300px] bg-gradient-radial from-blistAccent/15 via-transparent to-transparent blur-3xl opacity-60" />

    {/* </div> */}

      <div className="relative z-10 pt-8 space-y-12">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
          {/* Left: copy & CTAs */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
              <span className="block">
                Find builders you{" "}
                <span className="text-blistAccent">trust</span>
              </span>
              <span className="block text-white">
                — verified by the Blacklist community.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-blistTextMuted max-w-xl">
              Blacklist is building a curated directory of developers,
              marketers, market makers, moderators and Web3 workers. Every
              profile is reviewed by humans and backed by on-chain history and
              references.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-blistAccent px-5 py-2.5 text-sm font-medium text-black shadow-blistGlow hover:bg-blistAccentSoft transition-colors"
              >
                Create account
              </a>
              <a
                href="/directory"
                className="inline-flex items-center justify-center rounded-full bg-white/5 px-5 py-2.5 text-sm font-medium text-blistTextMain hover:bg-white/10 border border-blistBorder"
              >
                Browse directory
              </a>
              <a
                href="/apply"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium text-blistAccent hover:text-white hover:bg-blistAccent/10 border border-blistAccent/30"
              >
                Apply for verification
              </a>
            </div>

            <p className="text-[12px] text-blistTextMuted">
              Manual vetting · References required · On-chain history
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <TrustWeb />
          </div>

          {/* Right: sample preview card */}
	  {/*
          <div className="hidden md:block">
            <div className="accent-border max-w-md ml-auto">
              <div className="bg-[#0A0B0E]/95 border border-blistBorder rounded-2xl px-5 py-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-blistTextMuted">
                  <span className="font-medium text-blistTextMain">
                    Sample of what your live directory will look like:
                  </span>
                  <span>Demo data · For preview only</span>
                </div>

                <div className="space-y-3 text-[12px]">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-blistTextMuted">
                        Top Verified
                      </div>
                      <div className="font-semibold text-blistTextMain">
                        Astra Labs
                      </div>
                      <div className="text-blistTextMuted/80">
                        Developer · Solana, bots, token contracts
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                      Verified by Blacklist
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-blistTextMain">
                        Nova Flow MM
                      </div>
                      <div className="text-blistTextMuted/80">
                        Market Maker · Liquidity strategy
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                      Verified by Blacklist
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-blistTextMain">
                        Luna Signal
                      </div>
                      <div className="text-blistTextMuted/80">
                        Marketer · Spaces & influencer campaigns
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] bg-amber-500/15 text-amber-300 border border-amber-400/40">
                      Pending review
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-blistTextMuted pt-1">
                  This preview shows the type of trusted service directory Blacklist
                  can become — a “who to trust” list for new projects.
                </p>
              </div>
            </div>
          </div> 
	  */}
        </section>

      </div>
    </div>
  );
}

