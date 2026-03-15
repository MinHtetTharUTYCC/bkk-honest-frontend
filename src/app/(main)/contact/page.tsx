'use client';

import { Mail, MessageSquare, MapPin, Clock, Send, Phone } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // For now, just show an alert
    alert('Thank you for your message! We\'ll get back to you within 48 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Have a question, suggestion, or need help? We'd love to hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-background py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Send Us a Message</h2>
            <p className="text-lg text-foreground/70">
              Use the form below and we'll get back to you as soon as possible
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-muted-foreground/90 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground/70"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-muted-foreground/90 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground/70"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-muted-foreground/90 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                  <label htmlFor="message" className="block text-sm font-semibold text-muted-foreground/90 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none placeholder:text-muted-foreground/70"
                    placeholder="Please provide as much detail as possible to help us assist you better..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Get in Touch</h3>
                <p className="text-foreground/70 mb-6">
                  We're a small but passionate team dedicated to making Thailand travel better for everyone. 
                  Your feedback, questions, and suggestions help us improve.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Based in Thailand</p>
                    <p className="text-foreground/60 text-sm">Southeast Asia</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Response Time</p>
                    <p className="text-foreground/60 text-sm">Usually within 24-48 hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Quick Tips for Better Support</h4>
                <ul className="text-foreground/70 text-sm space-y-1">
                  <li>• Be specific about the issue you're experiencing</li>
                  <li>• Include your browser type if it's a technical problem</li>
                  <li>• Mention specific locations or content when relevant</li>
                  <li>• Screenshots are helpful for bug reports</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-blue-400 mb-2">Looking to Contribute?</h4>
                <p className="text-foreground/70 text-sm mb-3">
                  Want to help make Thailand Honest better? We're always looking for community moderators, 
                  local experts, and passionate contributors.
                </p>
                <a 
                  href="/about" 
                  className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
                >
                  Learn more about getting involved →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Common Questions</h2>
            <p className="text-lg text-foreground/70">Quick answers to frequently asked questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">How do I report incorrect information?</h3>
              <p className="text-foreground/60 text-sm">
                Use the "Report" button on any review or spot page, or contact us directly with details 
                about what needs to be corrected.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Can I update my review?</h3>
              <p className="text-foreground/60 text-sm">
                Yes! Go to your profile, find your review, and click "Edit" to update your experience 
                or add new information.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">How do you verify reviews?</h3>
              <p className="text-foreground/60 text-sm">
                Our community flags suspicious content, and our moderators review reports. We also use 
                automated systems to detect fake reviews.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Is there a mobile app?</h3>
              <p className="text-foreground/60 text-sm">
                Currently, Thailand Honest is a responsive web application that works great on mobile browsers. 
                A dedicated app may come in the future!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
