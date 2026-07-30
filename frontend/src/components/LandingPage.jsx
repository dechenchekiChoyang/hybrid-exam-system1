import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Lock,
  BookOpen,
  UserCheck
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onSignIn }) {
  return (
   <div id="home" className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-black">
      
      {/* 1. Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-slate-900 font-bold text-base shadow-lg shadow-cyan-500/20">
              EC
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              ExamCore
            </span>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <a href="#home" className="hover:text-blue-600 transition">Home</a>
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#roles" className="hover:text-blue-600 transition">Roles</a>
            
          </nav>

          <div className="flex items-center space-x-4 text-sm">
            <button 
              onClick={onSignIn} 
              className="text-slate-700 hover:text-slate-900 font-medium transition"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-slate-950 font-semibold rounded-lg shadow-md shadow-cyan-500/10 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <section className="relative w-full min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-white via-blue-50 to-white text-slate-900 overflow-hidden px-6 py-20">
      
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
        src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1600&auto=format&fit=crop"
        alt="University Campus"
        className="w-full h-full object-cover opacity-25"
        />
        {/* Radial gradient overlay to keep text legible */}
        <div className="absolute inset-0 bg-radial from-slate-900/60 via-slate-900/90 to-slate-900 pointer-events-none" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        
        {/* Top Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-600/10 border border-blue-200 text-blue-600 text-xs font-semibold tracking-wide uppercase">
          <span>ONLINE ASSESSMENT PLATFORM</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Simplified Exam Management <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
            for Academia
          </span>
        </h1>

        {/* Subtitle / Description */}
        <p className="text-slate-700 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Manage your institution's entire testing lifecycle—from test creation and student session scheduling to automated scoring and result distribution.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
           type="button"
           onClick={onSignIn} 
            //   className="text-slate-700 hover:text-slate-900 font-medium transition"
          className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-slate-950 font-bold text-sm rounded-lg shadow-lg shadow-cyan-500/20 transition-all">
            Get Started
          </button>
          
          <button className="w-full sm:w-auto px-7 py-3 bg-white/80 hover:bg-white text-slate-900 font-semibold text-sm rounded-lg border border-slate-300/80 hover:border-slate-600 transition-all">
            View Features
          </button>
        </div>

      </div>

    </section>

      {/* 3. Core Features */}
      <section id="features" className="py-16 max-w-6xl mx-auto px-6 border-t border-slate-200/80">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
        Features
        </h2>

        <p className="text-slate-600 mt-3">
        Everything you need to create, manage, evaluate, and publish online
        examinations through one modern and intuitive platform.
        </p>
      </div>
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-xl bg-white/40 border border-slate-200 hover:border-blue-300 transition space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
              <Lock className="w-5 h-5" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900">Tab-Switch Prevention</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Maintains test focus by restricting students from switching browser tabs during an ongoing examination.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/40 border border-slate-200 hover:border-blue-300 transition space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Automated & Manual Grading</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Objective questions are graded automatically, while instructors can manually review and evaluate written responses.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/40 border border-slate-200 hover:border-blue-300 transition space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant Results Publishing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Students can view and download their official result once it is published.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Role Breakdown Section */}
      <section id="roles" className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Built for Every Role</h2>
            <p className="text-slate-600 text-sm mt-2">Clear dashboards designed specifically for students, instructors, and administrators.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Student Role */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm">
                <UserCheck className="w-4 h-4" />
                <span>Students</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Take Exams & Track Scores</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Access scheduled exams seamlessly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Distraction-free environment with timer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>View published results</span>
                </li>
              </ul>
            </div>

            {/* Instructor Role */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Instructors</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Create, Grade & Publish</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Publish new exams for students</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Grade descriptive answers </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Publish final result for student viewing</span>
                </li>
              </ul>
            </div>

            {/* Admin Role */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Administrators</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">System Oversight</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Manage student & teacher accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Monitor system-wide exam activities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Ensure operational uptime and stability</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      
    
      {/*  CALL-TO-ACTION BANNER */}
      <section className="w-full bg-slate-50 border-t border-slate-200 py-14 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
            Ready to upgrade your examination ecosystem?
          </h3>
          
          <p className="text-slate-600 text-sm">
            Empower your faculty and students with a reliable, modern assessment engine.
          </p>

          <form className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter official email address" 
              className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-md bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
            <button 
              type="submit" 
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-950 font-bold rounded-md transition-colors text-sm"
            >
              Get Started
            </button>
          </form>
        </div>
      </section>


      {/* 3. BOTTOM FOOTER */}
      <footer className="w-full bg-slate-50 border-t border-slate-200/80 py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          
          {/* Brand Info */}
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-slate-900">ExamCore ERP</h4>
            <p className="text-slate-500 text-xs">
              © 2026 ExamCore ERP. Next-Generation Assessment Infrastructure.
            </p>
          </div>

          {/* Legal Links */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Legal</p>
            <ul className="space-y-1 text-slate-600 text-xs">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* System Links */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-700 text-xs uppercase tracking-wider">System</p>
            <ul className="space-y-1 text-slate-600 text-xs">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Security Overview</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>
      </footer>
      </div>
  

    
  );
}