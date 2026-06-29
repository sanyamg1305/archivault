import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MessageSquare,
  Wallet,
  History,
  FolderTree,
  CheckCircle,
  LayoutDashboard,
  Layers,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Home,
  Bath,
  UtensilsCrossed,
  Sofa
} from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans tracking-tight text-zinc-950 selection:bg-zinc-950 selection:text-white dark:bg-zinc-950 dark:text-zinc-50 dark:selection:bg-white dark:selection:text-zinc-950 overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center">
            <Image src="/logo.png" alt="ArchiVault" width={180} height={60} className="object-contain" priority />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="#how-it-works" className="hover:text-zinc-950 dark:hover:text-white transition-colors">How it Works</Link>
            <Link href="#features" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Features</Link>
            <Link href="#client-experience" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Client Portal</Link>
          </nav>
          <div className="flex items-center gap-4">
            {!userId ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-[oklch(0.52_0.17_258)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[oklch(0.46_0.17_258)] shadow-sm">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            ) : (
                <Link href="/dashboard" className="rounded-full bg-[oklch(0.52_0.17_258)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[oklch(0.46_0.17_258)] shadow-sm">
                  Go to Dashboard
                </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 lg:pt-40">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl font-semibold tracking-tighter sm:text-7xl lg:text-8xl text-balance">
              The Operating System for <span className="text-[oklch(0.52_0.17_258)] dark:text-[oklch(0.62_0.17_258)] whitespace-nowrap">Architecture & Design</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl text-balance leading-relaxed">
              Move from scattered coordination to a single source of truth. Stop losing project decisions in WhatsApp, emails, and fragmented spreadsheets.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignUpButton mode="modal">
                <button className="group flex h-12 items-center justify-center gap-2 rounded-full bg-[oklch(0.52_0.17_258)] px-8 text-base font-medium text-white transition-all hover:bg-[oklch(0.46_0.17_258)] hover:scale-105 active:scale-95 shadow-xl shadow-[oklch(0.52_0.17_258)]/30">
                  Start Your First Project
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </SignUpButton>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">No credit card required</p>
            </div>
          </div>

          {/* Hero Image Mockup */}
          <div className="mx-auto mt-20 max-w-6xl rounded-[2rem] border border-zinc-200/50 bg-white/50 p-2 shadow-2xl backdrop-blur-3xl dark:border-zinc-800/50 dark:bg-zinc-900/50">
            <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 aspect-[16/9] relative shadow-inner">
              {/* Abstract Dashboard UI Representation */}
              <div className="absolute inset-0 p-8 flex flex-col gap-6 opacity-80">
                 {/* Top Bar */}
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex gap-4 items-center">
                       <div className="h-8 w-8 rounded bg-zinc-200 dark:bg-zinc-800" />
                       <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="flex gap-2">
                       <div className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                       <div className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                    </div>
                 </div>
                 {/* Content Grid */}
                 <div className="flex gap-6 h-full">
                    <div className="w-64 flex flex-col gap-4">
                       {[...Array(5)].map((_, i) => (
                           <div key={`nav-${i}`} className="h-10 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50 w-full" />
                       ))}
                    </div>
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="flex gap-6 h-32">
                           <div className="flex-1 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center p-6 gap-4">
                              <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
                              <div>
                                <div className="h-4 w-24 rounded bg-green-600/20 dark:bg-green-400/20 mb-2" />
                                <div className="h-8 w-32 rounded bg-green-600/40 dark:bg-green-400/40" />
                              </div>
                           </div>
                           <div className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                           <div className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 Grid place-items-center p-12">
                           {/* Simulated Room Grid */}
                           <div className="grid grid-cols-3 gap-4 w-full h-full">
                              {[...Array(6)].map((_, i) => (
                                <div key={`card-${i}`} className="bg-white dark:bg-zinc-950 rounded-lg shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col">
                                   <div className="w-full h-32 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-t-lg" />
                                   <div className="p-4 flex-1">
                                      <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
                                      <div className="h-3 w-1/2 rounded bg-zinc-200/50 dark:bg-zinc-800/50" />
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product UI Showcase */}
        <section className="mt-32 py-24 sm:py-32 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
                Every decision, tracked and approved.
              </h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                Your full project — materials, rooms, approvals — in one place.
              </p>
            </div>

            {/* Split-panel mockup */}
            <div className="mx-auto max-w-6xl rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="ml-4 h-5 w-56 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center px-3 gap-2">
                  <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  <div className="h-2 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>

              <div className="flex h-[540px]">
                {/* Left panel — list */}
                <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex gap-2 mb-3">
                      <button className="px-3 py-1.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-medium">Pending <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5 py-0.5">5</span></button>
                      <button className="px-3 py-1.5 rounded-full text-zinc-500 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Approved 12</button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>Group by: Room</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {/* Group: Kitchen */}
                    <div className="px-4 pt-3 pb-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <UtensilsCrossed className="h-3 w-3" />
                        Kitchen · 2
                      </div>
                    </div>
                    {[
                      { name: "Calacatta Marble Slab", sub: "Counter & Island", badge: "Action required", badgeColor: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400", dot: "bg-red-500", active: true },
                      { name: "Matte Black Fixtures", sub: "Faucets & Handles", badge: "Pending review", badgeColor: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400", dot: "bg-amber-500", active: false },
                    ].map((item) => (
                      <div key={item.name} className={`mx-2 my-1 rounded-xl px-3 py-3 cursor-pointer transition-colors ${item.active ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`h-2 w-2 rounded-full shrink-0 mt-1 ${item.dot}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.name}</p>
                              <p className="text-xs text-zinc-500 truncate">{item.sub}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 ml-4">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                        </div>
                      </div>
                    ))}

                    {/* Group: Master Suite */}
                    <div className="px-4 pt-4 pb-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <Home className="h-3 w-3" />
                        Master Suite · 2
                      </div>
                    </div>
                    {[
                      { name: "Engineered Oak Flooring", sub: "Bedroom & Dressing", badge: "Sent for approval", badgeColor: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400", dot: "bg-blue-500" },
                      { name: "Linen Wallcovering", sub: "Feature Wall", badge: "Pending review", badgeColor: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400", dot: "bg-amber-500" },
                    ].map((item) => (
                      <div key={item.name} className="mx-2 my-1 rounded-xl px-3 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${item.dot}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.name}</p>
                            <p className="text-xs text-zinc-500 truncate">{item.sub}</p>
                          </div>
                        </div>
                        <div className="mt-2 ml-4">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                        </div>
                      </div>
                    ))}

                    {/* Group: Bathrooms */}
                    <div className="px-4 pt-4 pb-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <Bath className="h-3 w-3" />
                        Bathrooms · 1
                      </div>
                    </div>
                    <div className="mx-2 my-1 rounded-xl px-3 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full shrink-0 bg-green-500" />
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Travertine Floor Tile</p>
                          <p className="text-xs text-zinc-500">Master Bath</p>
                        </div>
                      </div>
                      <div className="mt-2 ml-4">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400">Approved</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right panel — detail */}
                <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                  {/* Detail header */}
                  <div className="px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Action required
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Calacatta Marble Slab</h3>
                      <p className="text-sm text-zinc-500 mt-0.5">Kitchen · Counter & Island · V2</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Clock className="h-3.5 w-3.5" />
                      Added 2 days ago
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                    {/* Material preview + specs */}
                    <div className="flex gap-6">
                      <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden flex items-end justify-end p-2">
                        <span className="text-[10px] text-zinc-400 font-medium">Marble.jpg</span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Supplier</p>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Stone World India · Mumbai</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Unit Cost</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">₹4,200 / sq ft</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">₹3,78,000</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Lead time</p>
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">6–8 weeks · Order by Aug 5</p>
                        </div>
                      </div>
                    </div>

                    {/* Rationale */}
                    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Designer&apos;s Note</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Selected for its consistent vein pattern across slabs — critical for the waterfall edge on the island. Italian origin with 15mm thickness ensures durability for the high-traffic kitchen counter.
                      </p>
                    </div>

                    {/* Budget impact */}
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-0.5">Budget Impact</p>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">Approved spend will increase to <span className="font-semibold">₹27,28,000</span> of ₹38,00,000</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-xs text-zinc-500">Remaining after approval</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">₹10,72,000</p>
                      </div>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center gap-3">
                    <button className="flex-1 h-11 rounded-xl bg-[oklch(0.52_0.17_258)] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[oklch(0.52_0.17_258)]/30 hover:bg-[oklch(0.46_0.17_258)] transition-colors">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve Material
                    </button>
                    <button className="flex-1 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      Request Change
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section id="how-it-works" className="mt-0 border-t border-zinc-200 dark:border-zinc-800 bg-white py-32 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
                Generic tools fail architects.
              </h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                Because they don't understand the physical design workflow.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col rounded-3xl border border-zinc-200 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-medium">Lost Approvals</h3>
                <p className="text-zinc-600 dark:text-zinc-400 flex-1">
                  Decisions buried in long WhatsApp chat threads and "final_final_v2" email chains causing costly execution errors.
                </p>
              </div>
              <div className="flex flex-col rounded-3xl border border-zinc-200 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-medium">Budget Blindness</h3>
                <p className="text-zinc-600 dark:text-zinc-400 flex-1">
                  Realizing you’re over budget only <span className="italic">after</span> the client enthusiastically approves those expensive marble slabs.
                </p>
              </div>
              <div className="flex flex-col rounded-3xl border border-zinc-200 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <History className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-medium">Version Confusion</h3>
                <p className="text-zinc-600 dark:text-zinc-400 flex-1">
                  Clients looking at outdated floor plans while the framing team is already working on the new structural modifications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Deep Dives */}
        <section id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-32">
            
            {/* Feature 1: Rooms */}
            <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 items-center">
              <div className="order-2 lg:order-1 flex justify-center">
                <div className="relative w-full max-w-md aspect-square rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl flex flex-col">
                   <div className="flex items-center gap-3 mb-6">
                      <FolderTree className="h-8 w-8 text-indigo-500" />
                      <h4 className="text-lg font-semibold">Master Suite</h4>
                   </div>
                   <div className="flex-1 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="h-16 w-16 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                         <div className="space-y-2 flex-1">
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                         </div>
                      </div>
                      <div className="flex items-center gap-4 opacity-50">
                         <div className="h-16 w-16 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                         <div className="space-y-2 flex-1">
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-balance mb-6">
                  Organize by Room, not by file extensions.
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  Organize your projects the way you physically build them. Group every drawing, render, specification, and material selection by room (e.g., Kitchen, Master Suite, Exterior) for instant clarity.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                     <CheckCircle className="h-6 w-6 text-[oklch(0.52_0.17_258)] dark:text-[oklch(0.62_0.17_258)] shrink-0" />
                     <span className="text-zinc-700 dark:text-zinc-300">Contextual grouping of assets directly maps to spatial reality.</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle className="h-6 w-6 text-[oklch(0.52_0.17_258)] dark:text-[oklch(0.62_0.17_258)] shrink-0" />
                     <span className="text-zinc-700 dark:text-zinc-300">Instantly locate associated materials for any specific area.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Action Center */}
            <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-balance mb-6">
                  The Client Action-Center
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  Give your clients a premium, tailored experience. A dedicated secure portal where they can review designs, read rationale, and approve materials with a single click. Say goodbye to "I never saw that" conversations.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                     <CheckCircle className="h-6 w-6 text-[oklch(0.52_0.17_258)] dark:text-[oklch(0.62_0.17_258)] shrink-0" />
                     <span className="text-zinc-700 dark:text-zinc-300">One-click transparent approvals with immutable audit logs.</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle className="h-6 w-6 text-[oklch(0.52_0.17_258)] dark:text-[oklch(0.62_0.17_258)] shrink-0" />
                     <span className="text-zinc-700 dark:text-zinc-300">Project an image of elite professionalism to high-net-worth clients.</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-md aspect-[4/3] rounded-[2rem] bg-zinc-950  border border-zinc-800 p-8 shadow-2xl flex flex-col text-white">
                   <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xl font-medium tracking-tight">Pending Approval</h4>
                      <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/30">Action Required</span>
                   </div>
                   <div className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between">
                      <div className="space-y-2">
                         <div className="h-5 bg-zinc-800 rounded w-3/4" />
                         <div className="h-4 bg-zinc-800 rounded w-1/2" />
                      </div>
                      <div className="flex gap-4">
                         <div className="h-10 flex-1 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-medium shadow-[0_0_15px_rgba(255,255,255,0.2)]">Approve</div>
                         <div className="h-10 flex-1 rounded-lg border border-zinc-700 flex items-center justify-center font-medium">Request Change</div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Financial Visibility */}
            <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 items-center">
              <div className="order-2 lg:order-1 flex justify-center">
                <div className="relative w-full max-w-md p-8 rounded-[2rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                   {/* Budget Bar UI */}
                   <h4 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Total Project Budget</h4>
                   <div className="text-4xl font-light mb-8">₹38,00,000</div>

                   <div className="space-y-3">
                      <div className="flex justify-between text-sm font-medium">
                         <span className="text-emerald-600 dark:text-emerald-400">Approved Spend</span>
                         <span>₹23,50,000</span>
                      </div>
                      <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden flex">
                         <div className="h-full bg-emerald-500 w-[62%]" />
                      </div>
                   </div>

                   <div className="mt-8 space-y-3">
                      <div className="flex justify-between text-sm font-medium">
                         <span className="text-amber-600 dark:text-amber-400">Pending Review</span>
                         <span>₹3,80,000</span>
                      </div>
                      <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden flex">
                         <div className="h-full bg-amber-500 w-[10%]" />
                      </div>
                   </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-balance mb-6">
                  Real-time Financial Visibility
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  Design with the budget in mind. Every material approval automatically updates the "Approved Spend" against the total budget. See your remaining runway in real-time before you specify that custom millwork.
                </p>
              </div>
            </div>

             {/* Feature 4: Version Stacking */}
             <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-balance mb-6">
                  Design Version Stacking
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  Keep your history, but show the future. Stack design iterations logically so the latest version is always front-and-center, while the complete audit trail of old versions is securely archived just a click away.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-sm aspect-square flex items-center justify-center perspective-[1000px]">
                   {/* Stacked Cards Effect */}
                   <div className="absolute w-64 h-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl transform translate-x-4 -translate-y-4 rotate-6 opacity-40 transition-transform hover:translate-x-6 hover:-translate-y-6" />
                   <div className="absolute w-64 h-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl transform translate-x-2 -translate-y-2 rotate-3 opacity-70 transition-transform hover:translate-x-3 hover:-translate-y-3" />
                   <div className="relative w-64 h-80 rounded-2xl border-2 border-zinc-950 dark:border-white bg-white dark:bg-zinc-950 shadow-2xl z-10 flex flex-col p-4">
                      <div className="flex justify-between items-center mb-4">
                         <span className="font-semibold">V3. Final Plan</span>
                         <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">Current</span>
                      </div>
                      <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center">
                         <LayoutDashboard className="h-12 w-12 text-zinc-400 opacity-50" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 py-32">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <h2 className="text-4xl font-semibold tracking-tighter sm:text-5xl lg:text-6xl text-balance">
              Ready to organize your studio?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed text-balance">
              Join forward-thinking architecture and design studios who have standardized their execution on Archivault.
            </p>
            <div className="mt-10 flex justify-center">
              <SignUpButton mode="modal">
                <button className="group flex h-14 items-center justify-center gap-2 rounded-full bg-[oklch(0.52_0.17_258)] px-10 text-lg font-medium text-white transition-all hover:bg-[oklch(0.46_0.17_258)] hover:scale-105 active:scale-95 shadow-xl shadow-[oklch(0.52_0.17_258)]/30">
                  Start Building
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </SignUpButton>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <Image src="/logo.png" alt="ArchiVault" width={150} height={50} className="object-contain" />
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Archivault. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="/privacy" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Terms</a>
            <a href="mailto:support@archivault.in" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
