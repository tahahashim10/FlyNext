'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileText, Globe, UserCheck } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <Link 
          href="/" 
          className="inline-flex items-center text-muted hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2" /> Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-primary">Terms & Conditions</h1>
            <p className="text-muted max-w-2xl mx-auto">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Shield className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              </div>
              <p className="text-muted">
                By accessing and using FlyNext, you agree to these terms. Please read carefully.
                If you do not agree, do not use our services.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <FileText className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">2. User Accounts</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>You must provide accurate, current, and complete information</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree to accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Globe className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">3. Booking Policies</h2>
              </div>
              <p className="text-muted mb-4">
                Bookings are subject to availability and confirmation. Prices and availability may change without notice.
              </p>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Cancellation and refund policies vary by hotel and flight</li>
                <li>Additional fees may apply for changes or cancellations</li>
                <li>We are not responsible for changes made by service providers</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Lock className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">4. Privacy & Data</h2>
              </div>
              <p className="text-muted">
                Your use of FlyNext is also governed by our Privacy Policy. We collect, use, 
                and protect your personal information in accordance with applicable laws.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <UserCheck className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">5. User Responsibilities</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Use the platform for lawful purposes only</li>
                <li>Respect the rights of other users and service providers</li>
                <li>Not engage in fraudulent or harmful activities</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted italic">
              These terms may be updated. Please check periodically for changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;