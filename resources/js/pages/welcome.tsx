import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { useEffect, useRef, useState } from 'react';
import {
    Shield,
    CreditCard,
    TrendingUp,
    Smartphone,
    ChevronRight,
    ArrowRight,
    Lock,
    BarChart3,
    Users,
    Globe,
    Menu,
    X,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   Inline CSS for custom animations & styles
   ────────────────────────────────────────────── */
const landingStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --co-blue: #004977;
  --co-blue-dark: #003459;
  --co-blue-light: #0072B8;
  --co-red: #D03027;
  --co-red-dark: #B31B1B;
  --co-white: #FFFFFF;
  --co-gray-50: #F8FAFB;
  --co-gray-100: #F0F4F7;
  --co-gray-200: #E1E8ED;
  --co-gray-300: #CCD6DE;
  --co-gray-500: #6B7B8D;
  --co-gray-700: #3A4A5C;
  --co-gray-900: #1A2332;
}

/* Hero gradient background */
.hero-gradient {
  background: linear-gradient(135deg, var(--co-blue) 0%, var(--co-blue-dark) 40%, #001F33 100%);
  position: relative;
  overflow: hidden;
}

.hero-gradient::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 80%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(208,48,39,0.08) 0%, transparent 70%);
  pointer-events: none;
}

.hero-gradient::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}

/* Floating shapes */
.floating-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.04;
  animation: float 20s ease-in-out infinite;
}

.floating-shape:nth-child(1) {
  width: 600px;
  height: 600px;
  background: var(--co-red);
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.floating-shape:nth-child(2) {
  width: 400px;
  height: 400px;
  background: white;
  bottom: -100px;
  left: -100px;
  animation-delay: -7s;
}

.floating-shape:nth-child(3) {
  width: 300px;
  height: 300px;
  background: var(--co-blue-light);
  top: 30%;
  right: 20%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

/* Fade-in animation */
.fade-in-up {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}

.fade-in-up.delay-1 { transition-delay: 0.1s; }
.fade-in-up.delay-2 { transition-delay: 0.2s; }
.fade-in-up.delay-3 { transition-delay: 0.3s; }
.fade-in-up.delay-4 { transition-delay: 0.4s; }
.fade-in-up.delay-5 { transition-delay: 0.5s; }

/* Feature card */
.feature-card {
  background: var(--co-white);
  border: 1px solid var(--co-gray-200);
  border-radius: 8px;
  padding: 2.5rem 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--co-blue);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 73, 119, 0.1);
  border-color: transparent;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card .icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.feature-card:hover .icon-wrapper {
  transform: scale(1.05);
}

/* Primary button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: var(--co-blue);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
  letter-spacing: -0.01em;
}

.btn-primary:hover {
  background: var(--co-blue-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 73, 119, 0.3);
}

/* Secondary button */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: transparent;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
  letter-spacing: -0.01em;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

/* Outline button */
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: transparent;
  color: var(--co-blue);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1.5px solid var(--co-blue);
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
  letter-spacing: -0.01em;
}

.btn-outline:hover {
  background: var(--co-blue);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 73, 119, 0.2);
}

/* Stats section */
.stats-section {
  background: linear-gradient(135deg, var(--co-gray-50) 0%, white 100%);
}

.stat-item {
  text-align: center;
  padding: 2rem;
}

.stat-number {
  font-size: 2.75rem;
  font-weight: 300;
  letter-spacing: -0.03em;
  line-height: 1;
  background: linear-gradient(135deg, var(--co-blue), var(--co-blue-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  color: var(--co-gray-500);
  font-size: 0.9375rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

/* CTA section */
.cta-section {
  background: linear-gradient(135deg, var(--co-blue) 0%, var(--co-blue-dark) 100%);
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(208,48,39,0.1) 0%, transparent 65%);
  pointer-events: none;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.06);
}

.navbar.scrolled .nav-link {
  color: var(--co-gray-700) !important;
}

.navbar.scrolled .nav-link:hover {
  color: var(--co-blue) !important;
}

.navbar.scrolled .nav-logo-text {
  color: var(--co-blue) !important;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
}

.nav-link:hover {
  color: white;
}

/* Trust banner */
.trust-banner {
  background: var(--co-gray-50);
  border-top: 1px solid var(--co-gray-200);
  border-bottom: 1px solid var(--co-gray-200);
}

/* Mobile menu */
.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-menu.open {
  transform: translateX(0);
}

/* Card grid pattern */
.card-grid-bg {
  background-image: radial-gradient(circle at 1px 1px, var(--co-gray-200) 1px, transparent 0);
  background-size: 24px 24px;
}

/* Counter animation */
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.count-animate {
  animation: countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Swoosh separator */
.swoosh-separator {
  position: relative;
}

.swoosh-separator::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 80px;
  background: white;
  clip-path: ellipse(55% 100% at 50% 100%);
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

/* Footer */
.footer {
  background: var(--co-gray-900);
  color: rgba(255, 255, 255, 0.6);
}

.footer a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
  font-size: 0.875rem;
}

.footer a:hover {
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .stat-number {
    font-size: 2.25rem;
  }

  .feature-card {
    padding: 2rem 1.5rem;
  }
}

/* Red accent line used as subtle brand element */
.accent-line {
  width: 48px;
  height: 3px;
  background: var(--co-red);
  border-radius: 4px;
}

/* Subtle card mockup for hero */
.hero-card-mock {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.hero-card-mock .mock-balance {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
}

.hero-card-mock .mock-label {
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.mock-chart-bar {
  background: linear-gradient(180deg, var(--co-blue-light), var(--co-blue));
  border-radius: 6px 6px 0 0;
  transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.mock-chart-bar.red {
  background: linear-gradient(180deg, var(--co-red), var(--co-red-dark));
}

/* Eyebrow label */
.eyebrow-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--co-blue);
  margin-bottom: 1.25rem;
}

/* Section title */
.section-title {
  font-size: 2.5rem;
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--co-gray-900);
}

.section-subtitle {
  font-size: 1rem;
  color: var(--co-gray-500);
  line-height: 1.7;
  max-width: 600px;
  font-weight: 400;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.75rem;
  }
}
`;

/* ──────────────────────────────────────────────
   Intersection Observer Hook
   ────────────────────────────────────────────── */
function useInView(options = {}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.15, ...options });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
}

/* ──────────────────────────────────────────────
   Counter Hook
   ────────────────────────────────────────────── */
function useCountUp(target: number, isVisible: boolean, duration = 2000) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) return;
        let start = 0;
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.floor(eased * target);
            setCount(start);
            if (progress >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [isVisible, target, duration]);

    return count;
}

/* ──────────────────────────────────────────────
   Capital LIfe Logo Component
   ────────────────────────────────────────────── */
function CapitalOneLogo({ scrolled }: { scrolled: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
                src="/CapitalOneLogo.png"
                alt="Capital LIfe"
                style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '999px' }}
            />
            <span
                className="nav-logo-text"
                style={{
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    letterSpacing: '-0.03em',
                    color: scrolled ? '#004977' : 'white',
                    transition: 'color 0.3s ease',
                }}
            >
                Capital LIfe
            </span>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll sections
    const features = useInView();
    const stats = useInView();
    const cta = useInView();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const statValues = [
        { target: 100, suffix: 'M+', label: 'Customers served' },
        { target: 99, suffix: '.9%', label: 'Uptime guaranteed' },
        { target: 50, suffix: '+', label: 'States covered' },
        { target: 24, suffix: '/7', label: 'Customer support' },
    ];

    const s0 = useCountUp(statValues[0].target, stats.isVisible);
    const s1 = useCountUp(statValues[1].target, stats.isVisible);
    const s2 = useCountUp(statValues[2].target, stats.isVisible);
    const s3 = useCountUp(statValues[3].target, stats.isVisible);
    const statCounts = [s0, s1, s2, s3];

    const featureItems = [
        {
            icon: <CreditCard size={24} />,
            title: 'Credit Solutions',
            desc: 'Comprehensive credit card programs with competitive rates, institutional-grade rewards, and zero foreign transaction fees.',
            color: '#004977',
            bg: '#EBF4FA',
        },
        {
            icon: <Shield size={24} />,
            title: 'Enterprise Security',
            desc: 'Multi-layered fraud detection systems with real-time transaction monitoring and automated threat response protocols.',
            color: '#004977',
            bg: '#EBF4FA',
        },
        {
            icon: <TrendingUp size={24} />,
            title: 'Wealth Analytics',
            desc: 'Data-driven financial analysis and portfolio optimization tools powered by advanced machine learning algorithms.',
            color: '#004977',
            bg: '#EBF4FA',
        },
        {
            icon: <Smartphone size={24} />,
            title: 'Digital Platform',
            desc: 'Full-service digital banking infrastructure for seamless account management, transfers, and payment processing.',
            color: '#004977',
            bg: '#EBF4FA',
        },
        {
            icon: <BarChart3 size={24} />,
            title: 'Investment Services',
            desc: 'Institutional-quality research and diversified investment vehicles designed for long-term capital growth.',
            color: '#004977',
            bg: '#EBF4FA',
        },
        {
            icon: <Lock size={24} />,
            title: 'Regulatory Compliance',
            desc: 'Full FDIC insurance coverage with zero-liability protection and adherence to federal banking regulations.',
            color: '#004977',
            bg: '#EBF4FA',
        },
    ];

    return (
        <>
            <Head title="Capital LIfe — Banking Reimagined">
                <meta
                    name="description"
                    content="Capital LIfe offers credit cards, banking, and loans with innovative technology, no hidden fees, and 24/7 customer support."
                />
            </Head>
            <style dangerouslySetInnerHTML={{ __html: landingStyles }} />

            <div className="landing-page" style={{ background: 'white' }}>
                {/* ─── NAVBAR ──────────────────────────── */}
                <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                    <div
                        style={{
                            maxWidth: '1200px',
                            margin: '0 auto',
                            padding: '1rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <CapitalOneLogo scrolled={scrolled} />

                        {/* Desktop nav */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2rem',
                            }}
                            className="hidden md:flex"
                        >
                            <a href="#features" className="nav-link">
                                Solutions
                            </a>
                            <a href="#stats" className="nav-link">
                                Performance
                            </a>
                            <a href="#cta" className="nav-link">
                                Get Started
                            </a>

                            {auth.user ? (
                                <Link href={dashboard()} className="btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={login()} className="btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
                                    Sign In
                                </Link>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: scrolled ? '#004977' : 'white',
                                cursor: 'pointer',
                                padding: '0.5rem',
                            }}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </nav>

                {/* ─── MOBILE MENU ─────────────────────── */}
                <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <CapitalOneLogo scrolled={true} />
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                            aria-label="Close menu"
                        >
                            <X size={24} color="#3A4A5C" />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.125rem', fontWeight: 600, color: '#3A4A5C', textDecoration: 'none' }}>Solutions</a>
                        <a href="#stats" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.125rem', fontWeight: 600, color: '#3A4A5C', textDecoration: 'none' }}>Performance</a>
                        <a href="#cta" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.125rem', fontWeight: 600, color: '#3A4A5C', textDecoration: 'none' }}>Get Started</a>
                        <div style={{ borderTop: '1px solid #E1E8ED', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {auth.user ? (
                                <Link href={dashboard()} className="btn-primary" style={{ justifyContent: 'center' }}>Dashboard</Link>
                            ) : (
                                <>
                                    <Link href={login()} className="btn-outline" style={{ justifyContent: 'center' }}>Sign In</Link>
                                    {canRegister && <Link href={register()} className="btn-primary" style={{ justifyContent: 'center' }}>Get Started</Link>}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── HERO ────────────────────────────── */}
                <section className="hero-gradient swoosh-separator" style={{ paddingTop: '8rem', paddingBottom: '8rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                    <div className="floating-shape" />
                    <div className="floating-shape" />
                    <div className="floating-shape" />

                    <div
                        style={{
                            maxWidth: '1200px',
                            margin: '0 auto',
                            padding: '0 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4rem',
                            flexWrap: 'wrap',
                            width: '100%',
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {/* Left content */}
                        <div style={{ flex: '1 1 480px', minWidth: '280px' }}>

                            <h1
                                style={{
                                    fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
                                    fontWeight: 300,
                                    color: 'white',
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.02em',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                Intelligent Financial
                                <br />
                                Solutions for Growth
                            </h1>

                            <p
                                style={{
                                    fontSize: '1.0625rem',
                                    color: 'rgba(255,255,255,0.55)',
                                    lineHeight: 1.7,
                                    marginBottom: '2.5rem',
                                    maxWidth: '500px',
                                }}
                            >
                                Capital LIfe delivers comprehensive banking, credit, and investment
                                services designed to accelerate your financial objectives.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {auth.user ? (
                                    <Link href={dashboard()} className="btn-primary">
                                        Access Dashboard
                                        <ArrowRight size={16} />
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={canRegister ? register() : login()} className="btn-primary">
                                            Open Account
                                            <ArrowRight size={16} />
                                        </Link>
                                        <Link href={login()} className="btn-secondary">
                                            Client Login
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right - Image */}
                        <div style={{ flex: '1 1 420px', display: 'flex', justifyContent: 'center', minWidth: '280px' }}>
                            <img
                                src="/CapitalOnePicture.avif"
                                alt="Capital LIfe"
                                style={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    borderRadius: '16px',
                                    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3)',
                                    objectFit: 'cover',
                                }}
                            />
                        </div>
                    </div>
                </section>


                {/* ─── FEATURES ────────────────────────── */}
                <section
                    id="features"
                    ref={features.ref}
                    style={{ padding: '6rem 1.5rem' }}
                >
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div
                            style={{ textAlign: 'center', marginBottom: '4rem' }}
                            className={`fade-in-up ${features.isVisible ? 'visible' : ''}`}
                        >
                            <p className="eyebrow-label">Our Solutions</p>
                            <h2 className="section-title">
                                Comprehensive Financial
                                <br />
                                Services Platform
                            </h2>
                            <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
                                An integrated suite of banking, credit, and investment solutions
                                engineered for performance, security, and scalability.
                            </p>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: '1.5rem',
                            }}
                        >
                            {featureItems.map((f, i) => (
                                <div
                                    key={i}
                                    className={`feature-card fade-in-up delay-${i + 1} ${features.isVisible ? 'visible' : ''}`}
                                >
                                    <div
                                        className="icon-wrapper"
                                        style={{ background: f.bg, color: f.color }}
                                    >
                                        {f.icon}
                                    </div>
                                    <h3
                                        style={{
                                            fontSize: '1.125rem',
                                            fontWeight: 600,
                                            color: '#1A2332',
                                            marginBottom: '0.75rem',
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {f.title}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: '0.9375rem',
                                            color: '#6B7B8D',
                                            lineHeight: 1.65,
                                        }}
                                    >
                                        {f.desc}
                                    </p>
                                    <a
                                        href="#"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.375rem',
                                            marginTop: '1.25rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: f.color,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        Learn more
                                        <ChevronRight size={16} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── STATS ──────────────────────────── */}
                <section
                    id="stats"
                    ref={stats.ref}
                    className="stats-section"
                    style={{ padding: '5rem 1.5rem' }}
                >
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div
                            style={{ textAlign: 'center', marginBottom: '3rem' }}
                            className={`fade-in-up ${stats.isVisible ? 'visible' : ''}`}
                        >
                            <p className="eyebrow-label">Performance</p>
                            <h2 className="section-title">
                                Proven Results,
                                <br />
                                Measurable Impact
                            </h2>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                            }}
                        >
                            {statValues.map((s, i) => (
                                <div
                                    key={i}
                                    className={`stat-item fade-in-up delay-${i + 1} ${stats.isVisible ? 'visible' : ''}`}
                                >
                                    <div className="stat-number">
                                        {statCounts[i]}
                                        {s.suffix}
                                    </div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── CTA ─────────────────────────────── */}
                <section
                    id="cta"
                    ref={cta.ref}
                    className="cta-section"
                    style={{ padding: '6rem 1.5rem' }}
                >
                    <div
                        style={{
                            maxWidth: '720px',
                            margin: '0 auto',
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1,
                        }}
                        className={`fade-in-up ${cta.isVisible ? 'visible' : ''}`}
                    >
                        <p
                            style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.45)',
                                marginBottom: '1.25rem',
                            }}
                        >
                            Get Started Today
                        </p>
                        <h2
                            style={{
                                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                                fontWeight: 300,
                                color: 'white',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.2,
                                marginBottom: '1.25rem',
                            }}
                        >
                            Start Building Your
                            <br />
                            Financial Strategy
                        </h2>
                        <p
                            style={{
                                fontSize: '1.0625rem',
                                color: 'rgba(255,255,255,0.55)',
                                lineHeight: 1.7,
                                marginBottom: '2.5rem',
                                maxWidth: '520px',
                                margin: '0 auto 2.5rem',
                            }}
                        >
                            Partner with Capital LIfe to access institutional-grade financial
                            services, advanced analytics, and dedicated advisory support.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {auth.user ? (
                                <Link href={dashboard()} className="btn-primary" style={{ background: 'white', color: '#004977' }}>
                                    Access Dashboard
                                    <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <>
                                    <Link href={canRegister ? register() : login()} className="btn-primary" style={{ background: 'white', color: '#004977' }}>
                                        Open Account
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link href={login()} className="btn-secondary">
                                        Client Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* ─── FOOTER ──────────────────────────── */}
                <footer className="footer" style={{ padding: '4rem 1.5rem 2rem' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '2.5rem',
                                marginBottom: '3rem',
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <img src="/CapitalOneLogo.png" alt="Capital LIfe" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '999px' }} />
                                    <span style={{ color: 'white', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>Capital LIfe</span>
                                </div>
                                <p style={{ fontSize: '0.8125rem', lineHeight: 1.7, maxWidth: '280px' }}>
                                    Delivering institutional-grade financial services to individuals and businesses nationwide.
                                </p>
                            </div>

                            <div>
                                <h4 style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', letterSpacing: '-0.01em' }}>Solutions</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                    <a href="#">Credit Programs</a>
                                    <a href="#">Savings Accounts</a>
                                    <a href="#">Business Banking</a>
                                    <a href="#">Lending Services</a>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Company</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                    <a href="#">About</a>
                                    <a href="#">Careers</a>
                                    <a href="#">Investor Relations</a>
                                    <a href="#">Newsroom</a>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Legal & Compliance</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                    <a href="#">Support Center</a>
                                    <a href="#">Security Policy</a>
                                    <a href="#">Privacy Notice</a>
                                    <a href="#">Regulatory Disclosures</a>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                paddingTop: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                fontSize: '0.8125rem',
                            }}
                        >
                            <span>© {new Date().getFullYear()} Capital LIfe. All rights reserved.</span>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <a href="#">Terms</a>
                                <a href="#">Privacy</a>
                                <a href="#">Cookies</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
