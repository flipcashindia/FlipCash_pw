import React from 'react';
// import HeroBanner from '../components/misc/HeroBanner';
// import PartnerBenefitsSection from '../components/misc/PartnerBenefitsSection';
// import BecomePartnerBanner from '../components/misc/BecomePartnerBanner';
// import DownloadAppBanner from '../components/misc/DownloadAppBanner';
// import CustomerReviews from '../components/misc/CustomerReviews';
// import TopBrands from '../components/misc/TopBrands';
// import BlogSlider from '../components/misc/BlogSlider';
import FAQSection from '../components/misc/FAQSection';
import HeroBanner from '../components/HeroBanner';
import PartnerBenefitsSection from '../components/PartnerBenefitsSection';
import BlogSlider from '../components/BlogSlider';
import DownloadAppBanner from '../components/DownloadAppBanner';
import CustomerReviews from '../components/CustomerReviews';
import BecomePartnerBanner from '../components/misc/BecomPartnerBanner';

const HomePage: React.FC = () => {
  return (
    <main>
      <HeroBanner />
      <PartnerBenefitsSection />
      <BecomePartnerBanner />
      <DownloadAppBanner />
      <CustomerReviews />
      {/* <TopBrands /> */}
      <BlogSlider />
      <FAQSection />
    </main>
  );
};

export default HomePage;