"use client";

import { useState } from 'react';
import { Mail, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSubmitContactForm } from '@/hooks/use-api';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const submitMutation = useSubmitContactForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitMutation.mutateAsync({
        data: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }
      });
      setIsSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch (error) {
      console.error('Contact submit error:', error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-4 tracking-tight">Message Received!</h1>
        <p className="text-white/60 max-w-md mb-8 leading-relaxed">
          Thanks for reaching out, <span className="text-amber-400 font-semibold">{formData.name}</span>. 
          Our team of honest Bangkokians will review your message and get back to you at <span className="text-white/90">{formData.email}</span> soon.
        </p>
        <button 
          onClick={() => {
            setIsSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
          }}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all active:scale-95"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
      <header className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
          <Mail size={12} />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight leading-tight">
          Contact <span className="text-amber-400">Honest Bangkok</span>
        </h1>
        <p className="text-white/40 text-sm md:text-base max-w-2xl leading-relaxed">
          Have a question about a spot? Found a bug? Or just want to say hello? 
          Drop us a message below and we&apos;ll get back to you as soon as we can.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Your Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Somchai"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Subject</label>
              <input
                required
                type="text"
                placeholder="What is this about?"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Message</label>
              <textarea
                required
                rows={5}
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all rounded-2xl px-5 py-6 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-amber-400 text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-display font-bold text-foreground tracking-tight">Why Contact Us?</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/90">Report a Problem</h4>
                  <p className="text-xs text-white/40 leading-relaxed mt-1">Found incorrect pricing or a scam alert that needs verification? Let us know.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/90">Partnerships</h4>
                  <p className="text-xs text-white/40 leading-relaxed mt-1">Want to collaborate or feature your honest local business? We&apos;d love to talk.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-white/30 leading-relaxed italic">
                  &ldquo;Honesty is the fastest way to prevent a mistake from turning into a failure.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-400 p-8 rounded-3xl text-black space-y-2">
            <h3 className="text-lg font-display font-bold tracking-tight">Need Urgent Help?</h3>
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              If you are currently experiencing a scam or safety issue, please contact local tourist police at <span className="font-bold underline">1155</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
