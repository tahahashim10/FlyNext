'use client';

import React, { Fragment, useRef, useState } from 'react';
import { XCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md'
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside content
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Close on ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
      onClick={handleBackdropClick}
      style={{ isolation: 'isolate' }} /* Ensures stacking context */
    >
      <div 
        ref={modalRef}
        className={`bg-background rounded-lg shadow-xl w-full ${sizeClasses[size]} animate-modal-in`}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold">{title}</h2>
            <button 
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        )}
        
        <div className="max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}