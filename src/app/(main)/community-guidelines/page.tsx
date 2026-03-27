"use client";

import {
  Users,
  Heart,
  Shield,
  MessageSquare,
  Flag,
  ThumbsDown,
} from "lucide-react";

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Community Guidelines</h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Help us build a positive, helpful community where everyone can
              discover authentic Thailand safely.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Community Values
            </h2>
            <p className="text-lg text-muted-foreground">
              These principles guide everything we do at BKK Honest
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Be Honest
              </h3>
              <p className="text-muted-foreground text-sm">
                Share authentic experiences, both positive and negative. Honesty
                helps everyone.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Be Respectful
              </h3>
              <p className="text-muted-foreground text-sm">
                Treat other community members, local businesses, and cultures
                with respect.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Be Helpful
              </h3>
              <p className="text-muted-foreground text-sm">
                Provide useful, actionable information that helps others make
                better decisions.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Be Constructive
              </h3>
              <p className="text-muted-foreground text-sm">
                Focus on solutions and helpful feedback rather than just
                complaints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Post */}
      <section className="bg-card/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                ✅ What to Post
              </h2>
              <div className="space-y-4">
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-semibold text-green-400 mb-2">
                    Honest Reviews
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Share genuine experiences with details about prices,
                    quality, atmosphere, and service.
                  </p>
                </div>

                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-semibold text-green-400 mb-2">
                    Helpful Tips
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Practical advice like best times to visit, how to order, or
                    cultural etiquette.
                  </p>
                </div>

                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-semibold text-green-400 mb-2">
                    Safety Warnings
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Alert others to scams, overcharging, unsafe conditions, or
                    tourist traps.
                  </p>
                </div>

                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-semibold text-green-400 mb-2">
                    Cultural Insights
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Help visitors understand local customs, appropriate
                    behavior, and cultural context.
                  </p>
                </div>

                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-semibold text-green-400 mb-2">
                    Updated Information
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Report changes in prices, hours, location, or status
                    (closed, renovated, etc.).
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                ❌ What NOT to Post
              </h2>
              <div className="space-y-4">
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h3 className="font-semibold text-destructive mb-2">
                    Fake Reviews
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Don&apos;t post reviews for places you haven&apos;t actually visited
                    or experiences you haven&apos;t had.
                  </p>
                </div>

                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h3 className="font-semibold text-destructive mb-2">
                    Personal Attacks
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Avoid attacking individuals, staff members, or other
                    community members personally.
                  </p>
                </div>

                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h3 className="font-semibold text-destructive mb-2">
                    Promotional Content
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Don&apos;t use the platform to advertise your business or promote
                    specific establishments for profit.
                  </p>
                </div>

                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h3 className="font-semibold text-destructive mb-2">
                    Offensive Content
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    No discriminatory, hateful, inappropriate, or culturally
                    insensitive content.
                  </p>
                </div>

                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h3 className="font-semibold text-destructive mb-2">
                    Spam or Off-Topic
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Keep content relevant to Thailand travel and experiences. No
                    spam or unrelated posts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Standards */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Review Standards
            </h2>
            <p className="text-lg text-muted-foreground">
              What makes a great review in our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Be Specific
              </h3>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li>• Include actual prices you paid</li>
                <li>• Mention specific dishes or services</li>
                <li>• Note the time/date of your visit</li>
                <li>• Describe the exact location</li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Be Balanced
              </h3>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li>• Mention both positives and negatives</li>
                <li>• Consider different perspectives</li>
                <li>• Acknowledge if you had unusual circumstances</li>
                <li>• Rate fairly compared to similar places</li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Be Helpful
              </h3>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li>• Share practical tips and tricks</li>
                <li>• Suggest best times to visit</li>
                <li>• Warn about potential issues</li>
                <li>• Recommend alternatives if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reporting and Moderation */}
      <section className="py-16 bg-muted/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Community Moderation
            </h2>
            <p className="text-lg text-muted-foreground">
              How we maintain quality and safety in our community
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-primary/10 p-8 rounded-xl border border-primary/20">
              <Flag className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Report Issues
              </h3>
              <p className="text-muted-foreground mb-4">
                Help us keep the community safe and useful by reporting content
                that violates our guidelines:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Fake or misleading reviews</li>
                <li>• Inappropriate or offensive content</li>
                <li>• Spam or promotional posts</li>
                <li>• Personal attacks or harassment</li>
                <li>• Off-topic or irrelevant content</li>
              </ul>
            </div>

            <div className="bg-destructive/10 p-8 rounded-xl border border-destructive/20">
              <ThumbsDown className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Consequences
              </h3>
              <p className="text-muted-foreground mb-4">
                Violations of community guidelines may result in:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Content removal or editing</li>
                <li>• Warning notifications</li>
                <li>• Temporary posting restrictions</li>
                <li>• Account suspension</li>
                <li>• Permanent community ban</li>
              </ul>
              <p className="text-xs text-muted-foreground/60 mt-4 italic">
                Most issues are resolved with friendly reminders. We believe in
                education over punishment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Questions About Our Guidelines?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            We&apos;re here to help! If you&apos;re unsure about something or need
            clarification, don&apos;t hesitate to reach out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Contact Us
            </a>
            <a
              href="/report"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-amber-600 transition-colors duration-200"
            >
              Submit a Report
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
