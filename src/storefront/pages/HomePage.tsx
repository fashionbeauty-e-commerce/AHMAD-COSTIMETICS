import HeroBanner from '../components/HeroBanner';
import Categories from '../components/Categories';
import PromoBanners from '../components/PromoBanners';
import FeaturedProducts from '../components/FeaturedProducts';
import TrustBadges from '../components/TrustBadges';
import Newsletter from '../components/Newsletter';

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <HeroBanner />
      <Categories />
      <PromoBanners />
      <FeaturedProducts />
      <TrustBadges />
      <Newsletter />
    </div>
  );
}
