/* eslint-disable @next/next/no-img-element --
 * The asset is an SVG with its own animations, served at its natural size.
 * next/image has nothing to optimise here and would route it through a raster
 * pipeline, which would flatten the filters this whole thing is made of.
 */

/**
 * The black hole the system is falling towards.
 *
 * This is Diego Inácio's Gargantua, generated from his notebook and served as a
 * static asset rather than reimplemented. Canvas has no answer to
 * `feTurbulence` or per-channel colour matrices, and two attempts at porting it
 * proved the point: what makes the image convincing is precisely that filter
 * work, so the honest thing is to use it.
 *
 * `mix-blend-mode: screen` is load-bearing, not decoration. The strands inside
 * the file composite in `screen` and therefore need something to screen
 * against, so the asset carries a black ground; blending the whole image in
 * screen makes that ground contribute nothing and lets only the light through.
 *
 * Purely decorative. Its internal animation is CSS rather than SMIL precisely
 * so that a media query inside the file can stop it for a visitor who asked for
 * less motion — SMIL could not have been.
 *
 * Regenerate with `scripts/build-gargantua.py`.
 */
export function BlackHole() {
  return (
    <img
      src="/gargantua.svg"
      alt=""
      aria-hidden="true"
      width={480}
      height={480}
      // Above the fold and the focal point of the hero, so never deferred.
      loading="eager"
      decoding="async"
      className="pointer-events-none absolute top-[44%] left-[80%] w-[78vw] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen select-none md:top-[46%] md:left-[88%] md:w-[62vmin]"
    />
  );
}
