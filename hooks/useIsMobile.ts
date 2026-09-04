import { useMediaQuery } from '@mui/material';

/**
 * Returns true for phones in both portrait and landscape.
 * - Portrait phones:  width < 768px
 * - Landscape phones: height < 500px (phones are short in landscape; tablets/laptops are taller)
 *
 * `noSsr` is left at its default (false) so both the server render and the
 * client's first hydration pass use `defaultMatches` (false), then MUI
 * self-corrects to the real value once mounted. `noSsr: true` does the
 * opposite of what its name suggests: it makes the client's very first
 * (hydrating) render read the live viewport immediately, which mismatches
 * the server-rendered markup (built with no viewport at all) and — since
 * MUI's `useSyncExternalStore`-based hydration keeps that server-shaped
 * snapshot on mismatch instead of forcing a redo — a real mobile visitor got
 * stuck on the desktop layout with no console warning to point at it.
 */
export default function useIsMobile(): boolean {
  const portraitPhone = useMediaQuery('(max-width: 767px)');
  const landscapePhone = useMediaQuery('(max-height: 499px)');
  return portraitPhone || landscapePhone;
}
