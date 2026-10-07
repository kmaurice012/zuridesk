import { colors } from "@zuridesk/ui/tokens";

import { publicEnvironment } from "../config/public-env";

export default function FoundationPage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10" style={{ backgroundColor: colors.paper }}>
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-between rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(54,37,28,0.10)] sm:p-14">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#713a57] uppercase">
            ZuriDesk
          </p>
          <span className="rounded-full bg-[#edf7f0] px-3 py-1 text-xs font-medium text-[#276749]">
            Foundation ready
          </span>
        </div>

        <div className="max-w-3xl py-16">
          <p className="mb-4 text-sm font-medium text-black/55">Phase 1 · Engineering foundation</p>
          <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-[#181411] sm:text-7xl">
            Built for the rhythm of a busy beauty business.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60">
            The web workspace is connected to a shared contract layer and ready for the approved
            product phases. No tenant or customer data exists in this foundation build.
          </p>
        </div>

        <div className="grid gap-3 border-t border-black/10 pt-6 text-sm text-black/55 sm:grid-cols-3">
          <p>Next.js web shell</p>
          <p>Fastify API boundary</p>
          <p className="truncate" title={publicEnvironment.NEXT_PUBLIC_API_URL}>
            API: {publicEnvironment.NEXT_PUBLIC_API_URL}
          </p>
        </div>
      </section>
    </main>
  );
}
