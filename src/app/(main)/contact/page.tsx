"use client";

import { MapPin, Clock, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/contact", formData);
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-linear-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Have a question, suggestion, or need help? We'd love to hear from
              you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-background py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Send Us a Message
            </h2>
            <p className="text-lg text-foreground/70">
              Use the form below and we'll get back to you as soon as possible
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              {isSuccess ? (
                <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-xl text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-foreground/70 mb-6">
                    Thank you for reaching out. We've received your message and
                    will get back to you within 48 hours.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-primary font-semibold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg text-destructive text-sm">
                      {error}
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-muted-foreground/90 mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground/70 disabled:opacity-50"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-muted-foreground/90 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground/70 disabled:opacity-50"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-muted-foreground/90 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50"
                    >
                      <option value="">Select a topic...</option>
                      <option value="general">General Question</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="content">Content Issue</option>
                      <option value="account">Account Problem</option>
                      <option value="safety">Safety Concern</option>
                      <option value="business">Business Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-muted-foreground/90 mb-2"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      rows={6}
                      className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none placeholder:text-muted-foreground/70 disabled:opacity-50"
                      placeholder="Please provide as much detail as possible to help us assist you better..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-linear-to-r from-amber-600 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Get in Touch
                </h3>
                <p className="text-foreground/70 mb-6">
                  I'm a solo developer on a mission to make Thailand travel
                  better and more transparent for everyone.I personally read
                  every message and suggestion. If you have any feedback, ideas,
                  or just want to say hi, please don't hesitate to reach out!
                  Your input helps shape the future of BKK Honest and makes it a
                  better resource for travelers like you. I look forward to
                  hearing from you! 🙏
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Based in Thailand
                    </p>
                    <p className="text-foreground/60 text-sm">Southeast Asia</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Response Time
                    </p>
                    <p className="text-foreground/60 text-sm">
                      Usually within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">
                  Quick Tips for Better Support
                </h4>
                <ul className="text-foreground/70 text-sm space-y-1">
                  <li>
                    • I always welcome bugs reports and new feature suggestions
                  </li>
                  <li>• Be specific about the issue you're experiencing</li>
                  <li>
                    • Include your browser type if it's a technical problem
                  </li>
                  <li>• Mention specific locations or content when relevant</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-blue-400 mb-2">
                  Looking to Contribute?
                </h4>
                <p className="text-foreground/70 text-sm mb-3">
                  Want to help make Thailand Honest better? We're always looking
                  for community moderators, local experts, and passionate
                  contributors.
                </p>
                <Link
                  href="/about"
                  className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
                >
                  Learn more about getting involved →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Common Questions
            </h2>
            <p className="text-lg text-foreground/70">
              Quick answers to frequently asked questions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                How do I report incorrect information?
              </h3>
              <p className="text-foreground/60 text-sm">
                Use the "Report" button on any review or spot page, or contact
                us directly with details about what needs to be corrected.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                Can I update my review?
              </h3>
              <p className="text-foreground/60 text-sm">
                Yes! Go to your profile, find your review, and click "Edit" to
                update your experience or add new information.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                How do you verify reviews?
              </h3>
              <p className="text-foreground/60 text-sm">
                Our community flags suspicious content, and our moderators
                review reports. We also use automated systems to detect fake
                reviews.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                Is there a mobile app?
              </h3>
              <p className="text-foreground/60 text-sm">
                Currently, BKK Honest is a responsive web application that works
                great on mobile browsers. A dedicated app may come in the
                future!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
