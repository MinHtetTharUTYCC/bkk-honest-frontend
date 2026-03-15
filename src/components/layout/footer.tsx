'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Music, 
  Mail, 
  MapPin, 
  Heart,
  ExternalLink
} from 'lucide-react';

import { FooterSection } from './footer-section';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/about', label: 'About BKK Honest' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/community-guidelines', label: 'Community Guidelines' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ];

  /* Social Media Links - Commented out for now
  const socialLinks = [
    { 
      href: 'https://instagram.com/bkkhonest', 
      label: 'Instagram', 
      icon: Instagram,
      color: 'hover:text-pink-400'
    },
    { 
      href: 'https://facebook.com/bkkhonest', 
      label: 'Facebook', 
      icon: Facebook,
      color: 'hover:text-blue-400'
    },
    { 
      href: 'https://twitter.com/bkkhonest', 
      label: 'Twitter', 
      icon: Twitter,
      color: 'hover:text-sky-400'
    },
    { 
      href: 'https://tiktok.com/@bkkhonest', 
      label: 'TikTok', 
      icon: Music,
      color: 'hover:text-red-400'
    },
  ];
  */

  return (
    <footer className="bg-black/95 border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* About & Quick Links */}
          <FooterSection title="BKK Honest">
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              The honest guide to Thailand. Real spots, real prices, real vibes. 
              By locals, for locals and travelers who want the truth.
            </p>
            <div className="space-y-2">
              {quickLinks.slice(0, 3).map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/70 hover:text-amber-400 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </FooterSection>

          {/* Community & Actions */}
          <FooterSection title="Community">
            <div className="space-y-3">
              <Link 
                href="/report"
                className="flex items-center text-sm text-amber-400 hover:text-amber-300 transition-colors duration-200 group"
              >
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Submit Report
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
              <Link 
                href="/contact"
                className="flex items-center text-sm text-white/70 hover:text-amber-400 transition-colors duration-200"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </Link>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50">
                Powered by <span className="text-amber-400 font-semibold">2.5K+</span> honest contributors
              </p>
            </div>
          </FooterSection>

          {/* Social Media - Commented out for now */}
          {/* 
          <FooterSection title="Follow Us">
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center text-sm text-white/70 ${social.color} transition-colors duration-200 group`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {social.label}
                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </a>
                );
              })}
            </div>
            
            <div className="mt-4">
              <p className="text-xs text-white/50">
                Tag us in your Thailand adventures! 
                <span className="text-amber-400"> #ThailandHonest</span>
              </p>
            </div>
          </FooterSection>
          */}

          {/* Legal & Company */}
          <FooterSection title="Legal">
            <div className="space-y-2">
              {quickLinks.slice(3).map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/70 hover:text-amber-400 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </FooterSection>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-white/50">
              © {currentYear} BKK Honest. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-white/50">
              <span>Keep Thailand honest</span>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1 fill-amber-400 text-amber-400" />
                <span>ประเทศไทย</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
