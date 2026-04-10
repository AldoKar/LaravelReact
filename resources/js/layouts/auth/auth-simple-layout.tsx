import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { Shield, Lock, CreditCard } from 'lucide-react';

const authStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.auth-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  display: flex;
  background: #FFFFFF;
}

/* Left panel - brand side */
.auth-brand-panel {
  display: none;
  width: 50%;
  background: linear-gradient(160deg, #004977 0%, #003459 50%, #001F33 100%);
  position: relative;
  overflow: hidden;
  padding: 3rem;
  flex-direction: column;
  justify-content: space-between;
}

@media (min-width: 1024px) {
  .auth-brand-panel {
    display: flex;
  }
}

.auth-brand-panel::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 70%;
  height: 160%;
  background: radial-gradient(ellipse, rgba(208,48,39,0.1) 0%, transparent 65%);
  pointer-events: none;
}

.auth-brand-panel::after {
  content: '';
  position: absolute;
  bottom: -20%;
  left: -15%;
  width: 50%;
  height: 80%;
  background: radial-gradient(ellipse, rgba(0,114,184,0.15) 0%, transparent 60%);
  pointer-events: none;
}

/* Floating geometric shapes */
.auth-shape {
  position: absolute;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  animation: authFloat 25s ease-in-out infinite;
}

.auth-shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  right: -5%;
  transform: rotate(15deg);
  animation-delay: 0s;
}

.auth-shape-2 {
  width: 200px;
  height: 200px;
  bottom: 15%;
  left: 5%;
  transform: rotate(-10deg);
  animation-delay: -8s;
}

.auth-shape-3 {
  width: 150px;
  height: 150px;
  top: 40%;
  left: 30%;
  transform: rotate(30deg);
  animation-delay: -16s;
}

@keyframes authFloat {
  0%, 100% { transform: rotate(15deg) translate(0, 0); }
  50% { transform: rotate(15deg) translate(15px, -15px); }
}

/* Right panel - form side */
.auth-form-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  position: relative;
}

@media (min-width: 1024px) {
  .auth-form-panel {
    width: 50%;
    padding: 3rem;
  }
}

.auth-form-container {
  width: 100%;
  max-width: 400px;
}

/* Brand features in left panel */
.auth-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 0;
}

.auth-feature-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.8);
}

.auth-feature-title {
  color: white;
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
  letter-spacing: -0.01em;
}

.auth-feature-desc {
  color: rgba(255,255,255,0.45);
  font-size: 0.8125rem;
  line-height: 1.6;
}

/* Form styling overrides */
.auth-form-container input[type="email"],
.auth-form-container input[type="text"],
.auth-form-container input[type="password"] {
  border: 1.5px solid #E1E8ED !important;
  border-radius: 10px !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.9375rem !important;
  transition: all 0.2s ease !important;
  background: #F8FAFB !important;
  color: #1A2332 !important;
}

.auth-form-container input[type="email"]:focus,
.auth-form-container input[type="text"]:focus,
.auth-form-container input[type="password"]:focus {
  border-color: #004977 !important;
  box-shadow: 0 0 0 3px rgba(0,73,119,0.1) !important;
  background: white !important;
  outline: none !important;
}

.auth-form-container input::placeholder {
  color: #9AACBB !important;
}

.auth-form-container label {
  color: #3A4A5C !important;
  font-weight: 600 !important;
  font-size: 0.8125rem !important;
  letter-spacing: -0.01em;
}

/* Primary button override */
.auth-form-container button[type="submit"] {
  background: #D03027 !important;
  border: none !important;
  border-radius: 10px !important;
  padding: 0.75rem 1.5rem !important;
  font-weight: 600 !important;
  font-size: 0.9375rem !important;
  letter-spacing: -0.01em;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  color: white !important;
  cursor: pointer;
}

.auth-form-container button[type="submit"]:hover {
  background: #B31B1B !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(208, 48, 39, 0.3) !important;
}

.auth-form-container button[type="submit"]:disabled {
  opacity: 0.7;
  transform: none;
  box-shadow: none !important;
}

/* Checkbox styling */
.auth-form-container button[role="checkbox"] {
  border-color: #CCD6DE !important;
  border-radius: 5px !important;
}

.auth-form-container button[role="checkbox"][data-state="checked"] {
  background: #004977 !important;
  border-color: #004977 !important;
}

/* Link overrides */
.auth-form-container a {
  color: #004977 !important;
  font-weight: 500;
  text-decoration: none !important;
  transition: color 0.2s ease;
}

.auth-form-container a:hover {
  color: #0072B8 !important;
  text-decoration: underline !important;
}

/* Back to home link */
.auth-back-link {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6B7B8D;
  font-size: 0.8125rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.auth-back-link:hover {
  color: #004977;
}

/* Trust footer on the form side */
.auth-trust-footer {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.auth-trust-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #9AACBB;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
`;

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: authStyles }} />
            <div className="auth-page">
                {/* ─── LEFT BRAND PANEL ────────────── */}
                <div className="auth-brand-panel">
                    <div className="auth-shape auth-shape-1" />
                    <div className="auth-shape auth-shape-2" />
                    <div className="auth-shape auth-shape-3" />

                    {/* Top - Logo */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <Link href={home()} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
                        <img src="/CapitalOneLogo.png" alt="Capital LIfe" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '999px' }} />
                            <span style={{ color: 'white', fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                          Capital LIfe
                            </span>
                        </Link>
                    </div>

                    {/* Middle - Features */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                            Your financial future
                            <br />
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>starts here.</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '380px' }}>
                          Join millions who trust Capital LIfe for secure, modern banking.
                        </p>

                        <div>
                            <div className="auth-feature-item" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                                <div className="auth-feature-icon">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <div className="auth-feature-title">Bank-Grade Security</div>
                                    <div className="auth-feature-desc">256-bit encryption and real-time fraud monitoring protect every transaction.</div>
                                </div>
                            </div>

                            <div className="auth-feature-item" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="auth-feature-icon">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <div className="auth-feature-title">No Hidden Fees</div>
                                    <div className="auth-feature-desc">$0 monthly fees, no minimums, and free overdraft protection.</div>
                                </div>
                            </div>

                            <div className="auth-feature-item" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="auth-feature-icon">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <div className="auth-feature-title">FDIC Insured</div>
                                    <div className="auth-feature-desc">Your deposits are insured up to $250,000 by the FDIC.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom - Copyright */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
                        © {new Date().getFullYear()} Capital LIfe. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* ─── RIGHT FORM PANEL ────────────── */}
                <div className="auth-form-panel">
                    {/* Back to home */}
                    <Link href={home()} className="auth-back-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back to home
                    </Link>

                    <div className="auth-form-container">
                        {/* Mobile logo */}
                        <div className="lg:hidden" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                            <Link href={home()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <img src="/CapitalOneLogo.png" alt="Capital LIfe" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '999px' }} />
                                <span style={{ color: '#004977', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                              Capital LIfe
                                </span>
                            </Link>
                        </div>

                        {/* Title */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ width: '48px', height: '3px', background: '#D03027', borderRadius: '4px', marginBottom: '1.25rem' }} />
                            <h1 style={{
                                fontSize: '1.625rem',
                                fontWeight: 800,
                                color: '#1A2332',
                                letterSpacing: '-0.03em',
                                lineHeight: 1.2,
                                marginBottom: '0.5rem',
                            }}>
                                {title}
                            </h1>
                            <p style={{
                                color: '#6B7B8D',
                                fontSize: '0.9375rem',
                                lineHeight: 1.6,
                            }}>
                                {description}
                            </p>
                        </div>

                        {/* Form content */}
                        {children}

                        {/* Trust footer */}
                        <div className="auth-trust-footer">
                            <div className="auth-trust-item">
                                <Lock size={12} />
                                <span>Encrypted</span>
                            </div>
                            <div className="auth-trust-item">
                                <Shield size={12} />
                                <span>FDIC Insured</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
