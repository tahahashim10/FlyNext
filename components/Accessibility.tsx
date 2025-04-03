'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Eye, 
  Keyboard, 
  Users, 
  HeartPulse, 
  Type 
} from 'lucide-react';

const Accessibility: React.FC = () => {
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
            <h1 className="text-4xl font-bold mb-4 text-primary">Accessibility Statement</h1>
            <p className="text-muted max-w-2xl mx-auto">
              FlyNext is committed to providing an inclusive and accessible experience for all users.
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <Eye className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">Visual Accessibility</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>High contrast mode available</li>
                <li>Screen reader compatible</li>
                <li>Alternative text for images</li>
                <li>Color-blind friendly design</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <Keyboard className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">Keyboard Navigation</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Full keyboard navigation support</li>
                <li>Skiplinks for main content</li>
                <li>Logical tab order</li>
                <li>Visible focus indicators</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <Users className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">Inclusive Design</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Simple and clear language</li>
                <li>Consistent navigation</li>
                <li>Cultural sensitivity in design</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <Type className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">Text and Typography</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Readable font sizes</li>
                <li>Sufficient color contrast</li>
                <li>Sans-serif font for better readability</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <HeartPulse className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-semibold">Assistive Technology</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Compatible with screen readers</li>
                <li>ARIA landmarks and roles</li>
                <li>Form input labels and instructions</li>
                <li>Error identification and correction guidance</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary mr-3 h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <h2 className="text-2xl font-semibold">Display Options</h2>
              </div>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Dark and light mode</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted">
              We are continuously improving our accessibility. 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;