import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, ArrowLeft } from 'lucide-react';
import BlogDefaultImg from "../assets/BlogDefault.png"; // Assuming same default image

// --- Mock Data (Copied from BlogSection) ---
// In a real app, this would come from a shared file or API
const blogData = [
  {
    id: 1,
    title: "How to Sell Old Phones Easily",
    description: "Learn how to get the best price for your used phones, laptops, and gadgets with our simple step-by-step process.",
    image: BlogDefaultImg,
    date: "Sep 5, 2025",
    author: "Admin",
    href: "/blog/1",
    // Full content for the detail page
    content: `
      <p class="mb-6">Selling your old phone, laptop, or gadget shouldn't be a hassle. With Flipcash, we've streamlined the process to ensure you get the best possible price with minimal effort. This guide will walk you through our simple step-by-step process.</p>
      <h3 class="text-2xl font-semibold mb-4">Step 1: Get an Instant Quote</h3>
      <p class="mb-6">First, find your device on our website. Select the model, condition, and any accessories you have. Our system will provide you with an instant, fair-market quote. No games, no-lowballing—just a transparent price.</p>
      <h3 class="text-2xl font-semibold mb-4">Step 2: Schedule a Pickup</h3>
      <p class="mb-6">Once you accept the quote, you can schedule a free, convenient pickup from your doorstep. Choose a date and time slot that works for you, and our verified agent will arrive on time.</p>
      <h3 class="text-2xl font-semibold mb-4">Step 3: Get Paid Instantly</h3>
      <p class="mb-6">Our agent will quickly verify your device's condition at your location. As soon as the device is verified, we process your payment instantly to your preferred method—be it UPI or bank transfer. It's that simple, safe, and fast.</p>
      <p>Ready to sell? <a href="/sell-old-product" class="text-teal-600 font-semibold hover:underline">Get your instant quote now</a>.</p>
    `
  },
  { id: 2, title: "Top 5 Tips for Buying Refurbished Laptops", description: "...", image: BlogDefaultImg, date: "Aug 25, 2025", author: "Admin", href: "/blog/2", content: "<p>Content for Refurbished Laptops...</p>" },
  { id: 3, title: "Why Recycling Electronics is Important", description: "...", image: BlogDefaultImg, date: "Aug 15, 2025", author: "Admin", href: "/blog/3", content: "<p>Content for Recycling Electronics...</p>" },
  { id: 4, title: "The Ultimate Guide to Smart Home Devices", description: "...", image: BlogDefaultImg, date: "Jul 30, 2025", author: "Admin", href: "/blog/4", content: "<p>Content for Smart Home Devices...</p>" },
  { id: 5, title: "Maximizing Your Device's Battery Life", description: "...", image: BlogDefaultImg, date: "Jul 21, 2025", author: "Admin", href: "/blog/5", content: "<p>Content for Battery Life...</p>" },
  { id: 6, title: "What to Look for in a Gaming Phone", description: "...", image: BlogDefaultImg, date: "Jul 10, 2025", author: "Admin", href: "/blog/6", content: "<p>Content for Gaming Phones...</p>" },
];

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogData.find(p => p.id.toString() === id);

  if (!post) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">Post not found</h1>
        <Link to="/blog" className="text-teal-600 font-semibold hover:underline">
          &larr; Back to all blogs
        </Link>
      </div>
    );
  }

  return (
    <section className="bg-white py-16">
      {/* Page Header Banner */}
      <div 
        className="py-16 md:py-20" 
        style={{ background: 'linear-gradient(to right, #fff7e0, #ffe8cc)' }}
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex justify-center items-center text-sm text-gray-600 space-x-6">
            <span className="flex items-center gap-2">
              <Calendar size={16} /> {post.date}
            </span>
            <span className="flex items-center gap-2">
              <User size={16} /> {post.author}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-6 max-w-4xl -mt-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover" 
          />
          {/* Article Content */}
          <article 
            className="p-6 md:p-10 prose prose-lg max-w-none"
            // We use dangerouslySetInnerHTML to render the mock HTML content
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-lg font-semibold text-teal-600 hover:text-teal-700 transition-colors group"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            Back to All Blogs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogDetailPage;
