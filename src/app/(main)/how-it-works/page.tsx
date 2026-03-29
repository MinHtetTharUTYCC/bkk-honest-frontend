"use client";

import {
  Search,
  MapPin,
  Users,
  Shield,
  Heart,
  Star,
  MessageSquare,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-linear-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">How BKK Honest Works</h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Discover authentic Thailand through community-driven reviews,
              real-time alerts, and honest recommendations from fellow travelers
              and locals.
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started Steps */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Getting Started
            </h2>
            <p className="text-lg text-muted-foreground">
              Follow these simple steps to make the most of BKK Honest
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-linear-to-r from-amber-600 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Explore
              </h3>
              <p className="text-muted-foreground">
                Browse our community-verified spots, read honest reviews, and
                discover hidden gems across Thailand. Use our map to find places
                near you.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-linear-to-r from-amber-600 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Contribute
              </h3>
              <p className="text-muted-foreground">
                Share your own experiences by submitting reports about places
                you&apos;ve visited. Help others by providing honest, detailed
                reviews.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-linear-to-r from-amber-600 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Stay Safe
              </h3>
              <p className="text-muted-foreground">
                Check scam alerts, read safety tips from the community, and stay
                informed about potential issues in different areas of Thailand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="bg-muted/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Key Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to explore Thailand safely and authentically
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-xl border border-border text-center shadow-sm">
              <Search className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Smart Search
              </h3>
              <p className="text-muted-foreground text-sm">
                Find exactly what you&apos;re looking for with our powerful search
                and filtering system.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border text-center shadow-sm">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Interactive Map
              </h3>
              <p className="text-muted-foreground text-sm">
                Explore Thailand visually with our detailed map showing spots,
                transit, and alerts.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border text-center shadow-sm">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Scam Alerts
              </h3>
              <p className="text-muted-foreground text-sm">
                Stay informed about scams and tourist traps with real-time
                community alerts.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border text-center shadow-sm">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Community Reviews
              </h3>
              <p className="text-muted-foreground text-sm">
                Read authentic reviews from real people who&apos;ve actually visited
                these places.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Reviews Work */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                How Our Reviews Work
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 shrink-0">
                    <Star className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Honest Rating System
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Our community rates places on authenticity, value, and
                      overall experience - not just popularity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Detailed Reviews
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Get practical information like prices, best times to
                      visit, what to expect, and insider tips.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 shrink-0">
                    <Zap className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Real-Time Updates
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Reviews are constantly updated as places change, so you
                      always get current information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 shrink-0">
                    <Shield className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Community Verified
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Reviews are validated by other community members to ensure
                      authenticity and accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-lg">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Sample Review Format
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Overall Rating:
                  </span>{" "}
                  ⭐⭐⭐⭐⭐
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Price Range:
                  </span>{" "}
                  50-150 THB per person
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Best Time:
                  </span>{" "}
                  Weekday lunch, avoid dinner rush
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Experience:
                  </span>
                  <p className="text-muted-foreground mt-1 italic">
                    &quot;Authentic local spot with amazing pad thai. Cash only, no
                    English menu but staff is helpful. Can get crowded after
                    7pm. Perfect for adventurous foodies!&quot;
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Tips:
                  </span>
                  <p className="text-muted-foreground mt-1 italic">
                    &quot;Try the green curry - it&apos;s not on the tourist menu but
                    locals love it. Bring small bills.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contributing Section */}
      <section className="py-16 bg-muted/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Contributing to the Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help make Thailand better for everyone by sharing your experiences
              and insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
              <Heart className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Submit a Report
              </h3>
              <p className="text-muted-foreground mb-4">
                Share your experience at any Thailand location. Whether it&apos;s a
                hidden gem, tourist trap, or something in between - your honest
                review helps others.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Rate the authenticity and value</li>
                <li>• Share practical tips and prices</li>
                <li>• Upload photos of your experience</li>
                <li>• Warn others about potential issues</li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
              <Shield className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Report Safety Issues
              </h3>
              <p className="text-muted-foreground mb-4">
                Help keep the community safe by reporting scams, overcharging,
                unsafe conditions, or other issues that travelers should know
                about.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Report scam attempts or overcharging</li>
                <li>• Alert about unsafe areas or conditions</li>
                <li>• Share recent changes or closures</li>
                <li>• Provide location-specific safety tips</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Explore?</h2>
          <p className="text-xl text-amber-100 mb-8">
            Start discovering authentic Thailand with help from our community of
            honest reviewers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/spots"
              className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Browse Spots
            </Link>
            <Link
              href="/map"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-amber-600 transition-colors duration-200"
            >
              Explore Map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
