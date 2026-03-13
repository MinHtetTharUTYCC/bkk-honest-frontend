'use client';

import { MapPin, Users, Heart, Shield, Zap, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">About BKK Honest</h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Your trusted community-driven platform for honest, authentic experiences in Thailand. 
              Discover hidden gems, avoid tourist traps, and navigate the country like a local.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Thailand is an incredible country full of amazing experiences, but navigating it can be overwhelming. 
                Tourist traps, overpriced attractions, and scams can turn a dream trip into a frustrating experience.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                That's why we created BKK Honest - a community where real people share genuine experiences, 
                honest reviews, and practical advice. We believe everyone deserves to experience the real Thailand, 
                from hidden local gems to authentic cultural experiences.
              </p>
              <p className="text-lg text-muted-foreground">
                Together, we're building a more transparent, trustworthy way to explore one of the world's 
                greatest destinations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Community Driven</h3>
                <p className="text-muted-foreground text-sm mt-2">Real reviews from real locals and travelers</p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Scam Protection</h3>
                <p className="text-muted-foreground text-sm mt-2">Stay safe with community-reported alerts</p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Honest Reviews</h3>
                <p className="text-muted-foreground text-sm mt-2">Authentic experiences, no paid promotions</p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Real-Time Updates</h3>
                <p className="text-muted-foreground text-sm mt-2">Fresh information you can trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Makes BKK Honest Different</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're not just another review site. We're a community committed to authentic, helpful experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Local Insights</h3>
              <p className="text-muted-foreground">
                Discover spots that only locals know about. From street food vendors to hidden temples, 
                find authentic Thailand experiences.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Community Verified</h3>
              <p className="text-muted-foreground">
                Every review, tip, and recommendation is verified by our community. No fake reviews, 
                no paid promotions - just honest experiences.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Always Updated</h3>
              <p className="text-muted-foreground">
                Thailand changes fast. Our community keeps information current, so you always have 
                the latest details about places, prices, and experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Built by Thailand Lovers</h2>
          <p className="text-lg text-muted-foreground mb-8">
            We're a team of locals, expats, and travel enthusiasts who are passionate about sharing 
            the real Thailand with the world. We've experienced the country's highs and lows, and we want 
            to help others make the most of their time here.
          </p>
          <p className="text-muted-foreground">
            Made with ❤️ in Thailand
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join the BKK Honest Community</h2>
          <p className="text-xl text-amber-100 mb-8">
            Help fellow travelers discover the real Thailand. Share your experiences, submit reports, 
            and be part of building a more honest travel community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/report" 
              className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Submit a Report
            </a>
            <a 
              href="/spots" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-amber-600 transition-colors duration-200"
            >
              Explore Spots
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
