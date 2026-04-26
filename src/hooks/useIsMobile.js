import { useMediaQuery } from '@mui/material';

/**
 * Returns true for phones in both portrait and landscape.
 * - Portrait phones:  width < 768px
 * - Landscape phones: height < 500px (phones are short in landscape; tablets/laptops are taller)
 */
export default function useIsMobile() {
  const portraitPhone = useMediaQuery('(max-width: 767px)');
  const landscapePhone = useMediaQuery('(max-height: 499px)');
  return portraitPhone || landscapePhone;
}
