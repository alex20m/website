import PortfolioApp from '@/components/PortfolioApp';
import { loadExperiences } from '@/lib/experiences';

export default function Home() {
  return <PortfolioApp experiences={loadExperiences()} />;
}
