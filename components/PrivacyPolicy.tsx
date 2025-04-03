'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Database, UserCheck, Globe } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
            <h1 className="text-4xl font-bold mb-4 text-primary">Privacy Policy</h1>
            <p className="text-muted max-w-2xl mx-auto">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <Shield className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Personal information (name, email, phone number)</li>
                <li>Booking details and preferences</li>
                <li>Payment information</li>
                <li>Device and usage information</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <Database className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Process bookings and payments</li>
                <li>Provide customer support</li>
                <li>Improve our services</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <Lock className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">3. Data Protection</h2>
              </div>
              <p className="text-muted mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Encryption of sensitive data</li>
                <li>Secure payment gateways</li>
                <li>Regular security audits</li>
                <li>Restricted access to personal information</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <UserCheck className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">4. Your Rights</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Lodge a complaint with data protection authorities</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <Globe className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">5. International Data Transfers</h2>
              </div>
              <p className="text-muted">
                Your information may be transferred to and maintained on computers located 
                outside of your state, province, country, or other governmental jurisdiction 
                where data protection laws may differ from those in your jurisdiction.
              </p>
            </section>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted italic">
              We are committed to protecting your privacy and ensuring data security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;