'use client';

import { Shield, Eye, Cookie, Database, Lock, Mail } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Your privacy matters to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-amber-200 mt-4">Last updated: March 2026</p>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Privacy at a Glance</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Your Data is Safe</h3>
                <p className="text-muted-foreground text-sm">We use industry-standard security to protect your information.</p>
              </div>
              <div className="text-center">
                <Eye className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No Hidden Tracking</h3>
                <p className="text-muted-foreground text-sm">We only collect what's necessary to provide our service.</p>
              </div>
              <div className="text-center">
                <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">You're in Control</h3>
                <p className="text-muted-foreground text-sm">You can access, update, or delete your data anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-background py-16">
        <div className="max-w-4xl mx-auto px-4 prose prose-lg prose-invert">
          <div className="space-y-12">
            {/* Information We Collect */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
                <Database className="w-8 h-8 text-primary mr-3" />
                Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Information You Provide</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• <strong>Account Information:</strong> Email address, username, profile information</li>
                    <li>• <strong>Reviews and Reports:</strong> Content you post, ratings, photos, location data</li>
                    <li>• <strong>Communications:</strong> Messages to our support team or feedback</li>
                    <li>• <strong>Authentication:</strong> Social media login information (if you choose to connect)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Information We Collect Automatically</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• <strong>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
                    <li>• <strong>Device Information:</strong> Browser type, device type, IP address, location (if permitted)</li>
                    <li>• <strong>Performance Data:</strong> Error logs, loading times, and technical diagnostics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
                <Eye className="w-8 h-8 text-primary mr-3" />
                How We Use Your Information
              </h2>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">We use your information to:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Provide and improve our service</li>
                    <li>• Display your reviews and contributions</li>
                    <li>• Send important updates and notifications</li>
                    <li>• Prevent spam and abuse</li>
                  </ul>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Respond to your support requests</li>
                    <li>• Analyze usage to improve features</li>
                    <li>• Ensure platform security</li>
                    <li>• Comply with legal requirements</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-primary">
                  <strong>We do NOT:</strong> Sell your personal information, send spam emails, or track you across other websites.
                </p>
              </div>
            </div>

            {/* Data Sharing */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Information Sharing</h2>
              
              <div className="space-y-4">
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-semibold text-green-400 mb-2">✅ What We Share Publicly</h3>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Your reviews, ratings, and photos you choose to post</li>
                    <li>• Your username and public profile information</li>
                    <li>• Aggregated, anonymous usage statistics</li>
                  </ul>
                </div>

                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h3 className="font-semibold text-destructive mb-2">❌ What We Keep Private</h3>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Your email address and contact information</li>
                    <li>• Your precise location data</li>
                    <li>• Your private messages and support conversations</li>
                    <li>• Your account security information</li>
                  </ul>
                </div>
              </div>

              <p className="text-muted-foreground mt-4">
                We may share information with service providers (like hosting and analytics) who help operate our platform, 
                but they're bound by strict confidentiality agreements.
              </p>
            </div>

            {/* Cookies and Tracking */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
                <Cookie className="w-8 h-8 text-primary mr-3" />
                Cookies and Tracking
              </h2>
              
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">Essential Cookies</h3>
                  <p className="text-muted-foreground text-sm">Required for the platform to work properly (login, security, preferences)</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Analytics Cookies</h3>
                  <p className="text-muted-foreground text-sm">Help us understand how you use the platform to improve it (you can opt-out)</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Preference Cookies</h3>
                  <p className="text-muted-foreground text-sm">Remember your settings and preferences for a better experience</p>
                </div>
              </div>

              <p className="text-muted-foreground mt-4 text-sm italic">
                You can control cookies through your browser settings, but some features may not work without them.
              </p>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Your Privacy Rights</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
                  <h3 className="font-semibold text-blue-400 mb-3">Access & Control</h3>
                  <ul className="text-muted-foreground text-sm space-y-2">
                    <li>• View all data we have about you</li>
                    <li>• Update or correct your information</li>
                    <li>• Download your data</li>
                    <li>• Delete your account and data</li>
                  </ul>
                </div>

                <div className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/20">
                  <h3 className="font-semibold text-purple-400 mb-3">Communication Preferences</h3>
                  <ul className="text-muted-foreground text-sm space-y-2">
                    <li>• Unsubscribe from email notifications</li>
                    <li>• Control what alerts you receive</li>
                    <li>• Opt-out of analytics tracking</li>
                    <li>• Manage cookie preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
                <Shield className="w-8 h-8 text-primary mr-3" />
                Data Security
              </h2>
              
              <p className="text-muted-foreground mb-4">
                We take your data security seriously and implement multiple layers of protection:
              </p>

              <div className="bg-muted/30 p-6 rounded-lg border border-border">
                <ul className="text-muted-foreground space-y-2">
                  <li>• <strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                  <li>• <strong>Access Controls:</strong> Strict limits on who can access your information</li>
                  <li>• <strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                  <li>• <strong>Incident Response:</strong> Rapid response plan for any security issues</li>
                  <li>• <strong>Data Minimization:</strong> We only collect what we actually need</li>
                </ul>
              </div>
            </div>

            {/* Updates and Contact */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Updates & Contact</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Policy Updates</h3>
                  <p className="text-muted-foreground text-sm">
                    We may update this privacy policy occasionally. We'll notify you of significant changes via email 
                    or a notice on the platform. The "last updated" date at the top shows when changes were made.
                  </p>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-primary mb-3 flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Questions or Concerns?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    If you have any questions about this privacy policy or how we handle your data, please contact us:
                  </p>
                  <ul className="text-primary text-sm space-y-1">
                    <li>• Email: privacy@bkkhonest.com</li>
                    <li>• Contact form: /contact</li>
                    <li>• Response time: Within 48 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
