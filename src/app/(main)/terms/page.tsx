"use client";

import {
  Scale,
  FileText,
  Users,
  Shield,
  AlertTriangle,
  Mail,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-linear-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              The legal terms and conditions for using BKK Honest platform and
              community.
            </p>
            <p className="text-amber-200 mt-4">Last updated: March 2026</p>
          </div>
        </div>
      </section>

      {/* Key Points Summary */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Terms Summary
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Users className="w-6 h-6 text-green-500 mr-3 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Community Platform
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Free platform for sharing honest Thailand travel
                      experiences
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-blue-500 mr-3 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Content Standards
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Community guidelines ensure helpful, respectful content
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Scale className="w-6 h-6 text-primary mr-3 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      User Responsibility
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      You&apos;re responsible for your content and account
                      security
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-destructive mr-3 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Use at Your Risk
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Information is user-generated; verify independently
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Terms Content */}
      <section className="bg-background py-16">
        <div className="max-w-4xl mx-auto px-4 prose prose-lg prose-invert">
          <div className="space-y-12">
            {/* Acceptance of Terms */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
                <FileText className="w-8 h-8 text-primary mr-3" />
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground">
                By accessing or using BKK Honest (&quot;the Platform&quot;), you
                agree to be bound by these Terms of Service. If you do not agree
                to these terms, please do not use our platform.
              </p>
              <p className="text-muted-foreground mt-4">
                These terms apply to all users, including visitors, registered
                users, and content contributors.
              </p>
            </div>

            {/* Platform Description */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                2. Platform Description
              </h2>
              <p className="text-muted-foreground mb-4">
                BKK Honest is a community-driven platform where users share
                honest reviews, experiences, and information about Thailand
                destinations, restaurants, attractions, and services.
              </p>
              <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-primary mb-2">
                  Platform Features Include:
                </h3>
                <ul className="text-muted-foreground space-y-1">
                  <li>• User-generated reviews and ratings</li>
                  <li>• Interactive maps and location information</li>
                  <li>• Community discussions and tips</li>
                  <li>• Scam alerts and safety information</li>
                  <li>• Search and discovery tools</li>
                </ul>
              </div>
            </div>

            {/* User Accounts */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                3. User Accounts
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Account Creation
                  </h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• You must provide accurate, current information</li>
                    <li>
                      • You are responsible for maintaining account security
                    </li>
                    <li>• One person, one account - no multiple accounts</li>
                    <li>
                      • Must be at least 16 years old to create an account
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Account Security
                  </h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Keep your login credentials confidential</li>
                    <li>• Notify us immediately of any unauthorized access</li>
                    <li>
                      • You are responsible for all activities under your
                      account
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Content Guidelines */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                4. Content Guidelines
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3">
                    ✅ Acceptable Content
                  </h3>
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <ul className="text-muted-foreground text-sm space-y-2">
                      <li>• Honest, personal experiences</li>
                      <li>• Constructive reviews and feedback</li>
                      <li>• Helpful tips and recommendations</li>
                      <li>• Factual information and updates</li>
                      <li>• Respectful community discussions</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-destructive mb-3">
                    ❌ Prohibited Content
                  </h3>
                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <ul className="text-muted-foreground text-sm space-y-2">
                      <li>• False or misleading information</li>
                      <li>• Spam, promotional, or commercial content</li>
                      <li>• Offensive, discriminatory, or harmful content</li>
                      <li>• Personal attacks or harassment</li>
                      <li>• Copyrighted material without permission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* User Responsibilities */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                5. User Responsibilities
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
                  <h3 className="font-semibold text-blue-400 mb-3">
                    When Using BKK Honest, You Agree To:
                  </h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>
                      • Provide accurate, honest information in your reviews
                    </li>
                    <li>• Respect other users and local businesses</li>
                    <li>
                      • Follow our community guidelines and platform rules
                    </li>
                    <li>• Report violations or inappropriate content</li>
                    <li>• Use the platform only for its intended purpose</li>
                    <li>
                      • Verify information independently before acting on it
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                6. Intellectual Property
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Your Content
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    You retain ownership of content you post, but grant us a
                    license to use, display, and distribute it on the platform
                    for the purpose of providing our service.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Platform Content
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    BKK Honest platform, design, features, and functionality are
                    owned by us and protected by copyright, trademark, and other
                    intellectual property laws.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimers */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                7. Disclaimers
              </h2>
              <div className="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/20">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-yellow-500 mb-2">
                      User-Generated Content
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      All reviews, ratings, and information are provided by
                      users. We do not verify accuracy or endorse any specific
                      businesses or recommendations.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-500 mb-2">
                      No Warranty
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      The platform is provided &quot;as is&quot; without
                      warranties. We do not guarantee accuracy, completeness, or
                      reliability of any information.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-500 mb-2">
                      Use at Your Own Risk
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      You use information from the platform at your own risk.
                      Always verify details independently and use your own
                      judgment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                8. Limitation of Liability
              </h2>
              <p className="text-muted-foreground mb-4">
                To the fullest extent permitted by law, BKK Honest shall not be
                liable for any indirect, incidental, special, or consequential
                damages arising from your use of the platform.
              </p>
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <p className="text-muted-foreground text-sm">
                  This includes but is not limited to: financial losses, travel
                  disruptions, safety incidents, or negative experiences
                  resulting from information or recommendations found on the
                  platform.
                </p>
              </div>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                9. Account Termination
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Your Right to Terminate
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    You may delete your account at any time through your account
                    settings or by contacting us.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Our Right to Terminate
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    We may suspend or terminate accounts that violate these
                    terms, community guidelines, or engage in harmful behavior.
                  </p>
                </div>
              </div>
            </div>

            {/* Changes to Terms */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                10. Changes to Terms
              </h2>
              <p className="text-muted-foreground mb-4">
                We may update these terms occasionally to reflect changes in our
                service or legal requirements. We&apos;ll notify users of
                significant changes via email or platform notifications.
              </p>
              <p className="text-muted-foreground italic">
                Continued use of the platform after changes constitutes
                acceptance of the new terms.
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
                <Mail className="w-8 h-8 text-primary mr-3" />
                Contact Us
              </h2>
              <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                <p className="text-primary mb-4">
                  Questions about these terms? We&apos;re here to help clarify
                  anything you need to know.
                </p>
                <div className="space-y-2 text-primary">
                  <p>📧 Email: legal@bkkhonest.com</p>
                  <p>💬 Contact form: /contact</p>
                  <p>⏱️ Response time: Within 48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
