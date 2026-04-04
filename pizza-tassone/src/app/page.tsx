import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedPizzas } from '@/components/home/FeaturedPizzas';
import { HowItWorks } from '@/components/home/HowItWorks';
import { StoresPreview } from '@/components/home/StoresPreview';
import { getFeaturedPizzas } from '@/data/menu';

export default function HomePage() {
  const featured = getFeaturedPizzas();

  return (
    <>
      <HeroSection />
      <FeaturedPizzas pizzas={featured} />
      <HowItWorks />
      <StoresPreview />
    </>
  );
}
