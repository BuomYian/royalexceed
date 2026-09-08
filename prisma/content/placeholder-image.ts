/**
 * Placeholder cover/hero imagery for seeded content, so the seed has no
 * dependency on real photography. Replace with genuine photos before go-live
 * (see README "Before go-live").
 */
export function placeholderImage(text: string, hex = "1a1d21", fg = "ffffff") {
  // .png on the fg segment (not the default .svg) so next/image can optimize it
  // without dangerouslyAllowSVG.
  return `https://placehold.co/1600x900/${hex}/${fg}.png?text=${encodeURIComponent(text)}`;
}
