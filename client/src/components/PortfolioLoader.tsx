export function PortfolioLoader() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="fixed top-0 left-0 right-0 h-1 bg-primary/40" />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
          <div className="hidden md:flex items-center gap-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`nav-${index}`}
                className="h-3 w-14 rounded-full bg-muted animate-pulse"
              />
            ))}
          </div>
          <div className="md:hidden h-8 w-8 rounded-full bg-muted animate-pulse" />
        </div>
      </header>

      <main className="pt-28">
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="h-6 w-40 rounded-full bg-muted animate-pulse" />
              <div className="h-14 w-72 rounded-2xl bg-muted animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded-full bg-muted/80 animate-pulse" />
                <div className="h-4 w-5/6 rounded-full bg-muted/80 animate-pulse" />
                <div className="h-4 w-2/3 rounded-full bg-muted/80 animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="h-12 w-36 rounded-full bg-muted animate-pulse" />
                <div className="h-12 w-36 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="flex gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`social-${index}`}
                    className="h-12 w-12 rounded-full bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="h-[360px] rounded-[2rem] bg-muted/40 border border-border animate-pulse" />
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 space-y-12">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`section-${index}`}
              className="rounded-2xl border border-border bg-card/60 p-6 animate-pulse"
            >
              <div className="h-6 w-40 rounded-full bg-muted mb-4" />
              <div className="h-4 w-full rounded-full bg-muted/80" />
              <div className="h-4 w-5/6 rounded-full bg-muted/80 mt-3" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
