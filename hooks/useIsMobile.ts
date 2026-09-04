import { useMediaQuery } from '@mui/material';

/**
 * Returns true for phones in both portrait and landscape.
 * - Portrait phones:  width < 768px
 * - Landscape phones: height < 500px (phones are short in landscape; tablets/laptops are taller)
 *
 * `noSsr: true` makes both the server render and the client's first render
 * use `defaultMatches` (false) rather than guessing from a server-side
 * viewport that doesn't exist — without it, a visitor whose real viewport is
 * mobile gets a hydration mismatch on every element this hook feeds into.
 */
export default function useIsMobile(): boolean {
  const portraitPhone = useMediaQuery('(max-width: 767px)', { noSsr: true });
  const landscapePhone = useMediaQuery('(max-height: 499px)', { noSsr: true });
  return portraitPhone || landscapePhone;
}
