import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden relative selection:bg-emerald-500/30">
      {}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-center gap-4 animate-fadeIn">
          <div className="glass p-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">EduBill</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-center tracking-tight max-w-4xl leading-tight animate-slideUp">
          School Billing <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Reimagined</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-16 text-center max-w-2xl leading-relaxed animate-slideUp animation-delay-200">
          Streamline fee management, track payments, and access records with our premium digital portal. Experience the future of school finance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4 md:px-0 animate-slideUp animation-delay-300">
          {}
          <div className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center group cursor-pointer hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="h-24 w-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Student Portal</h2>
            <p className="text-center text-slate-400 mb-10 leading-relaxed max-w-sm relative z-10">
              Log in to view your academic fee structure, pay outstanding dues securely, and download payment receipts.
            </p>
            <Link
              href="/login?role=student"
              className="relative z-10 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-white font-bold text-lg text-center shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
            >
              Login as Student
            </Link>
          </div>

          {}
          <div className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center group cursor-pointer hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="h-24 w-24 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 ring-1 ring-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Administration</h2>
            <p className="text-center text-slate-400 mb-10 leading-relaxed max-w-sm relative z-10">
              Access the control panel to manage student enrollments, monitor financial records, and track revenue.
            </p>
            <Link
              href="/login?role=admin"
              className="relative z-10 w-full rounded-2xl bg-white/5 border border-white/10 px-8 py-4 text-white font-bold text-lg text-center hover:bg-white/10 hover:border-indigo-400/50 hover:text-indigo-400 transition-all backdrop-blur-md"
            >
              Login as Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
