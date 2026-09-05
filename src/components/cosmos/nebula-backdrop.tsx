/**
 * Static atmosphere behind the star field: two distant nebulae and a faint
 * survey grid, in the manner of a printed star chart.
 *
 * Deliberately a server component built from gradients alone — no canvas, no
 * JavaScript, nothing to hydrate. It sits below the star field and never moves,
 * which is what gives the moving layers something to move against.
 */
export function NebulaBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-void" />

      {/* Violet nebula, upper left. */}
      <div
        className="absolute -top-[20%] -left-[10%] h-[70vmax] w-[70vmax] opacity-40 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle at center, color-mix(in oklab, var(--color-nebula) 55%, transparent), transparent 62%)',
        }}
      />

      {/* Cyan nebula, lower right. */}
      <div
        className="absolute -right-[15%] -bottom-[25%] h-[60vmax] w-[60vmax] opacity-30 blur-[140px]"
        style={{
          background:
            'radial-gradient(circle at center, color-mix(in oklab, var(--color-star) 45%, transparent), transparent 65%)',
        }}
      />

      {/* Survey grid, faded out towards the edges so it never draws attention. */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-horizon) 1px, transparent 1px), linear-gradient(90deg, var(--color-horizon) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 78%)',
        }}
      />
    </div>
  );
}
