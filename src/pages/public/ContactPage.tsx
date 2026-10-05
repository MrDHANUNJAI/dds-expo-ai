import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject line is required';
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide a message or inquiry';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Contact' }]} />

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact Support & Inquiries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Have questions about billing, enterprise contracts, or marketplace disputes? We're here to help.
          </p>
        </div>

        {submitted && (
          <Alert
            type="success"
            title="Message Dispatched (Frontend Simulation)"
            message="Thank you for reaching out! In Phase 2, this will submit directly to our CRM ticketing system."
            onDismiss={() => setSubmitted(false)}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Jonathan Reed"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />

              <Input
                label="Subject"
                placeholder="What can we help you with?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                error={errors.subject}
              />

              <div className="text-left">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your inquiry with detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full bg-white text-slate-900 placeholder:text-slate-400 border text-sm rounded-lg p-3 transition-all focus:outline-none focus:ring-2 ${
                    errors.message
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-semibold"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Details & Direct Help */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Direct Channels
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Email Support</p>
                    <p className="text-slate-500">support@worknova.io</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Average response under 4 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Enterprise Inquiries</p>
                    <p className="text-slate-500">partnerships@worknova.io</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Dedicated account management</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Headquarters</p>
                    <p className="text-slate-500">548 Market Street, Suite 39201</p>
                    <p className="text-slate-500">San Francisco, CA 94104</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Support Hours</p>
              <p>24/7 Global Escrow & Dispute Resolution Desk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
