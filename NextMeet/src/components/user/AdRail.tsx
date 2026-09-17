import { Video } from "lucide-react";

const AdRail = () => {
  return (
    <aside className="flex w-full gap-4 overflow-x-auto pb-2 lg:sticky lg:top-6 lg:w-[300px] lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
      <div className="relative h-[220px] min-w-[280px] flex-1 overflow-hidden rounded-md border border-[#e5e5eb] bg-white sm:h-[250px] sm:min-w-[300px] lg:w-[300px] lg:flex-none">
        <div className="absolute left-2 top-1 z-10 text-[9px] text-[#a0a3b4]">Advertisement</div>
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#f0edff] via-white to-[#f7f5ff] px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#5b3fd6] shadow-sm">
            <Video size={28} className="text-white" />
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7b6bd6]">NextMeet</p>
          <h3 className="mt-1 text-lg font-bold text-[#171a3a]">Meet. Connect. Collaborate.</h3>
          <p className="mt-1 text-[11px] leading-4 text-[#777b93]">Simple and reliable online meetings.</p>
          <button type="button" className="mt-4 rounded-md bg-[#5b3fd6] px-5 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4d32c5]">Learn More</button>
        </div>
      </div>

      <div className="relative h-[220px] min-w-[280px] flex-1 overflow-hidden rounded-md border border-[#e5e5eb] bg-white sm:h-[250px] sm:min-w-[300px] lg:w-[300px] lg:flex-none">
        <div className="absolute left-2 top-1 z-10 text-[9px] text-[#a0a3b4]">Advertisement</div>
        <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
          <div className="flex h-[90px] w-full items-center justify-center rounded-lg bg-[#171a3a]">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">Sponsored</p>
              <p className="mt-1 text-xl font-bold text-white">CLOUD<span className="text-[#8d7bea]">PRO</span></p>
            </div>
          </div>
          <h3 className="mt-4 text-base font-bold text-[#171a3a]">Work smarter online</h3>
          <p className="mt-1 text-[11px] leading-4 text-[#777b93]">Powerful tools for modern teams.</p>
          <button type="button" className="mt-4 rounded-md border border-[#5b3fd6] px-5 py-2 text-[11px] font-semibold text-[#5b3fd6] transition hover:bg-[#eeeaff]">Explore</button>
        </div>
      </div>
    </aside>
  );
};

export default AdRail;
