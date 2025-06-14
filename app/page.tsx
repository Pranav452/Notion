"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Star,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Users,
  FileText,
  Zap,
  Shield,
} from "lucide-react";
import ScrollContext from "@/components/SmoothScrollContext";
import PremierFacilities from "@/components/priemeir-facility";
import Events from "@/components/evnets";

// Helper component for icons (replace with actual SVGs or an icon library)
// Removed IconPlaceholder component

// Removed CubeIcon component

// Removed StarIcon component

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["AI Solutions", "Documentation"];

  return (
    <ScrollContext>
      <div className="flex w-full flex-col min-h-screen bg-[#fdfdfd] text-black font-sora selection:bg-black selection:text-white ">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-neutralGray">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-black">
              Notion Clone
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="#"
                className="text-sm text-neutralMid hover:text-black"
              >
                Home
              </Link>
              <Link
                href="#"
                className="text-sm text-neutralMid hover:text-black"
              >
                Features
              </Link>
              <div className="relative group">
                <button className="text-sm text-neutralMid hover:text-black flex items-center">
                  Pricing
                </button>
              </div>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="hidden md:inline-block bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-neutralDark transition-colors"
              >
                Sign In
              </Link>
              <button
                className="md:hidden text-black"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-neutralGray">
              <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
                <Link
                  href="#"
                  className="text-sm text-neutralMid hover:text-black"
                >
                  Home
                </Link>
                <Link
                  href="#"
                  className="text-sm text-neutralMid hover:text-black"
                >
                  Features
                </Link>
                <Link
                  href="#"
                  className="text-sm text-neutralMid hover:text-black"
                >
                  Pricing
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-neutralMid hover:text-black"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="w-full bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-neutralDark transition-colors mt-2 text-center block"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </header>

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="bg-neutralLight py-16 md:py-24 md:px-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#FCFCF5] p-8 md:p-12 rounded-2xl border border-black shadow-sm ">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight text-black">
                      Your Workspace, Enhanced by AI
                    </h1>
                    <p className="text-neutralMid text-base md:text-lg leading-relaxed">
                      A Notion-style collaborative workspace with AI superpowers – designed for productivity, 
                      knowledge discovery, and effortless linking between your ideas and documents.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <button className="bg-black text-white px-7 py-3 rounded-lg text-sm font-medium hover:bg-neutralDark transition-colors">
                        Get Started
                      </button>
                      <Link
                        href="/signup"
                        className="border border-black text-black px-7 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors"
                      >
                        Book a Demo
                      </Link>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden aspect-w-4 aspect-h-3 md:aspect-w-16 md:aspect-h-10">
                    <Image
                      src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                      alt="Team collaborating in workspace"
                      width={600}
                      height={450}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Smart Linking Section */}
          <section className="bg-[#FCFCF5] py-16 md:py-24 md:px-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-w-4 aspect-h-3 md:aspect-w-16 md:aspect-h-10 order-2 md:order-1">
                  <Image
                    src="https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                    alt="AI auto-linking interface"
                    width={600}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col space-y-6 order-1 md:order-2">
                  <p className="text-sm text-neutralMid uppercase tracking-wider">
                    AI Features
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight text-black">
                    AI Auto-Linking Technology
                  </h2>
                  <p className="text-neutralMid text-base md:text-lg leading-relaxed">
                    As you write, our AI detects and suggests relevant internal links to other workspace pages.
                    This creates a web of knowledge that makes navigation intuitive and discovery effortless.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="flex items-start space-x-3">
                      <Users
                        className="w-8 h-8 text-neutralDark mt-1 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <div>
                        <h3 className="font-semibold text-black mb-1">
                          Smart References
                        </h3>
                        <p className="text-sm text-neutralMid">
                          Automatically identify mentions of other documents and suggest linking them.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FileText
                        className="w-8 h-8 text-neutralDark mt-1 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <div>
                        <h3 className="font-semibold text-black mb-1">
                          Backlinks
                        </h3>
                        <p className="text-sm text-neutralMid">
                          See which pages reference your current document to understand relationships.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section 2 */}
          <section className="bg-white container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center md:px-8">
            <p className="text-sm text-neutralMid uppercase tracking-wider mb-2">
              Key Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight text-black max-w-3xl mx-auto mb-6">
              Your Knowledge Graph, Visualized
            </h2>
            <p className="text-neutralMid text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-12">
              Visualize how all pages are connected via references and backlinks in an interactive graph view.
              Helps you track content relationships in complex workspaces and discover new insights.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-12 items-center">
              {/* Left Features */}
              <div className="flex flex-col gap-8 text-left md:text-right">
                <div className="flex md:flex-col items-center space-x-3  md:space-x-3">
                  <Box
                    className="w-8 h-8 text-black mt-1 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-black mb-1 text-center">
                      Workspace Builder
                    </h3>
                    <p className="text-sm text-neutralMid text-center">
                      Create pages and workspaces with real-time rich text editing and markdown support.
                    </p>
                  </div>
                </div>
                <div className="flex md:flex-col items-center space-x-3 md:space-x-3">
                  <Box
                    className="w-8 h-8 text-black mt-1 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-black mb-1 text-center">
                      Auto Tag Generator
                    </h3>
                    <p className="text-sm text-neutralMid text-center">
                      AI generates semantic tags based on page content for smart filtering and faster search.
                    </p>
                  </div>
                </div>
              </div>

              {/* Center Image */}
              <div className="rounded-2xl overflow-hidden shadow-lg  max-w-sm mx-auto my-8 md:my-0 order-first md:order-none">
                <Image
                  src="https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                  alt="Knowledge graph visualization"
                  width={500}
                  height={350}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Features */}
              <div className="flex flex-col gap-8 text-left">
                <div className="flex md:flex-col items-center space-x-3">
                  <Box
                    className="w-8 h-8 text-black mt-1 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <div>
                    <h3 className="font-semibold text-black mb-1 text-center">
                      Q&A Engine
                    </h3>
                    <p className="text-sm text-neutralMid text-center">
                      Ask natural language questions about your workspace content and get AI-powered answers.
                    </p>
                  </div>
                </div>
                <div className="flex md:flex-col items-center space-x-3">
                  <Box
                    className="w-8 h-8 text-black mt-1 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <div>
                    <h3 className="font-semibold text-black mb-1 text-center">
                      Nested Structure
                    </h3>
                    <p className="text-sm text-neutralMid text-center">
                      Organized page structure with nesting and hierarchy for better content organization.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex justify-center gap-4">
              <button className="border border-neutralGray text-black px-7 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">
                Learn More
              </button>
              <Link
                href="/signup"
                className="bg-black text-white px-7 py-3 rounded-lg text-sm font-medium hover:bg-neutralDark transition-colors flex items-center"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </section>
          <PremierFacilities />

          {/* Transform Documentation Section */}
      <Events />

          {/* Testimonial Section */}
          <section className="bg-[#FDFDFA] py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-goldStar fill-current"
                  />
                ))}
              </div>
              <p className="text-xl md:text-2xl italic mb-6 text-black leading-relaxed">
                "This Notion clone has completely transformed how our team organizes information. 
                The AI auto-linking feature connects our documentation in ways we never thought possible!"
              </p>
              <div className="flex items-center justify-center space-x-3">
                <Image
                  src="/img3.png"
                  alt="Emily Chen"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-sm text-black">
                    Emily Chen
                  </p>
                  <p className="text-xs text-neutralMid">
                    Product Manager at TechCorp
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-[#FDFDFA] py-16 md:py-24 md:px-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-[1fr_2fr] gap-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
                    Frequently asked questions
                  </h2>
                  <p className="text-neutralMid mb-8">
                    Find answers to your most pressing questions about our Notion clone's
                    features and functionality.
                  </p>
                  <button className="border border-black text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">
                    Contact us
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-x-10 gap-y-10 md:px-12">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-black">
                      How does the AI auto-linking work?
                    </h3>
                    <p className="text-neutralMid text-sm leading-relaxed">
                      As you type, our AI analyzes your content and identifies potential references to other pages in your workspace. 
                      It then suggests links that you can accept with a single click, creating connections between related content.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-black">
                      What is the Knowledge Graph Builder?
                    </h3>
                    <p className="text-neutralMid text-sm leading-relaxed">
                      The Knowledge Graph Builder visualizes how all your pages are connected through an interactive graph. 
                      You can see relationships between documents, identify knowledge clusters, and discover new connections.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-black">
                      How does the Workspace Q&A Engine work?
                    </h3>
                    <p className="text-neutralMid text-sm leading-relaxed">
                      The Q&A Engine allows you to ask natural language questions about your workspace content. 
                      Our AI scans all your documents and returns the most relevant answers using semantic search technology.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-black">
                      What is Auto Tag Generation?
                    </h3>
                    <p className="text-neutralMid text-sm leading-relaxed">
                      Our AI analyzes your page content and automatically generates semantic tags (like #marketing or #analytics) 
                      that help organize your workspace. These tags enable smart filtering and faster search across documents.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-black">
                      Can I collaborate with my team?
                    </h3>
                    <p className="text-neutralMid text-sm leading-relaxed">
                      Yes, our platform supports real-time collaboration. Multiple team members can work on the same document 
                      simultaneously, with changes syncing instantly across all users.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-black">
                      Is there a free trial?
                    </h3>
                    <p className="text-neutralMid text-sm leading-relaxed">
                      Yes, we offer a free trial period so you can experience all the features before committing. 
                      Sign up today to start building your AI-enhanced workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-[#FDFDFA] py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
                Start Building Your Knowledge Network
              </h2>
              <p className="text-neutralMid text-base md:text-lg leading-relaxed mb-8">
                Ready to transform your workspace? Start your free trial today and experience the power of AI-driven knowledge management.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/signup"
                  className="bg-black text-white px-7 py-3 rounded-lg text-sm font-medium hover:bg-neutralDark transition-colors"
                >
                  Start Free Trial
                </Link>
                <button className="border border-black text-black px-7 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
          </section>

          {/* Newsletter Signup Section */}
          <section className="bg-[#FDFDFA] container mx-auto px-4 sm:px-6 lg:px-14 py-16 md:py-24 ">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
                  Notion Clone
                </h2>
                <p className="text-neutralMid text-base md:text-lg leading-relaxed">
                  Stay updated on the latest features and insights. Subscribe to our newsletter 
                  for exclusive updates on AI-powered workspace solutions and productivity tips.
                </p>
              </div>
              <div>
                <form className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="flex-grow px-4 py-3 border border-neutralGray rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm bg-neutralLight text-black placeholder-neutralMid"
                  />
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutralDark transition-colors flex-shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="text-xs text-neutralMid mt-3">
                  By signing up you agree with our Terms and conditions.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-[#000000] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-16">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12 pb-12 border-b border-neutralMid/30">
              <div className="flex items-start space-x-4">
                <Mail
                  className="h-6 w-6 text-white mt-1 flex-shrink-0"
                  strokeWidth={1.5}
                />
                <div>
                  <h4 className="text-white font-semibold mb-1">Email</h4>
                  <p className="text-sm text-white">
                    Have questions or need support? We're here to help!
                  </p>
                  <a
                    href="mailto:hello@notionclone.com"
                    className="text-sm text-white hover:underline"
                  >
                    hello@notionclone.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone
                  className="h-6 w-6 text-white mt-1 flex-shrink-0"
                  strokeWidth={1.5}
                />
                <div>
                  <h4 className="text-white font-semibold mb-1">Phone</h4>
                  <p className="text-sm text-white">
                    Reach us anytime for assistance or inquiries.
                  </p>
                  <a
                    href="tel:+15551234567"
                    className="text-sm text-white hover:underline"
                  >
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <MapPin
                  className="h-6 w-6 text-white mt-1 flex-shrink-0"
                  strokeWidth={1.5}
                />
                <div>
                  <h4 className="text-white font-semibold mb-1">Office</h4>
                  <p className="text-sm text-white">
                    Visit us for any in-person support or consultations.
                  </p>
                  <p className="text-sm text-white">
                    123 Innovation Drive, San Francisco CA 94105 US
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Links & Subscribe */}
            <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-8 mb-16">
              <div className="col-span-2 md:col-span-1">
                <Link
                  href="/"
                  className="text-2xl font-bold text-white mb-4 block"
                >
                  Notion Clone
                </Link>
                <p className="text-sm text-white mb-3">Subscribe to updates</p>
                <p className="text-xs text-white mb-3">
                  Stay informed about our latest features and insights.
                </p>
                <form className="flex mb-2">
                  <input
                    type="email"
                    placeholder="Your email here"
                    required
                    className="flex-grow px-3 py-2 border-none rounded-l-md text-sm bg-[#595753] text-white placeholder-white focus:outline-none focus:ring-1 focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="bg-[#595753] text-white px-4 py-2 rounded-r-md text-sm font-medium hover:bg-[#6a6864] transition-colors border-l border-neutralDark/50"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="text-xs text-white">
                  By subscribing, you agree to our{" "}
                  <Link href="#" className="underline hover:text-white">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Integrations
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      API
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Security
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Tutorials
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Community
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Webinars
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Press
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Partners
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h4 className="font-semibold text-white mb-4">
                  Follow Us
                </h4>
                <ul className="space-y-2 mb-6">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Twitter
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      LinkedIn
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      GitHub
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      Discord
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white hover:text-white"
                    >
                      YouTube
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutralMid/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center text-sm">
              <div className="mb-4 md:mb-0 text-center md:text-left text-white">
                <span>
                  © {new Date().getFullYear()} Notion Clone. All rights reserved.
                </span>
                <Link href="#" className="ml-4 text-white hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="#" className="ml-4 text-white hover:text-white">
                  Terms of Service
                </Link>
                <Link href="#" className="ml-4 text-white hover:text-white">
                  Cookie Settings
                </Link>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  aria-label="Facebook"
                  className="text-white hover:text-white"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  aria-label="Instagram"
                  className="text-white hover:text-white"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  aria-label="X (Twitter)"
                  className="text-white hover:text-white"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  aria-label="LinkedIn"
                  className="text-white hover:text-white"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  aria-label="Youtube"
                  className="text-white hover:text-white"
                >
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ScrollContext>
  );
}