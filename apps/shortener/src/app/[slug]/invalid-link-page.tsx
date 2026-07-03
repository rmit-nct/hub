export default function InvalidLinkPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#121321] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.16),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(119,224,255,0.08),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex max-w-md items-center justify-center pt-[18svh]">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/6 p-8 text-center shadow-[0_24px_80px_rgba(2,8,23,0.45)] backdrop-blur-xl">
          <div className="mx-auto mb-5 inline-flex rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 font-medium text-[11px] text-rose-200/90 uppercase tracking-[0.28em]">
            Link Error
          </div>
          <h1 className="mb-4 font-semibold text-3xl text-rose-100">
            Invalid URL
          </h1>
          <p className="mb-8 text-white/68 leading-relaxed">
            The shortened link you're looking for is invalid.
          </p>
          <a
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 font-semibold text-white transition-colors hover:bg-white/14 focus:outline-none focus:ring-4 focus:ring-white/10"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
