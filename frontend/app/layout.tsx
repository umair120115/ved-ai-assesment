// // frontend/app/layout.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { useAuthStore } from "@/store/useAuthStore";
// import { supabase } from "../lib/Supabase";

// const inter = Inter({ subsets: ["latin"] });

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   const { user, isLoading, initializeAuth } = useAuthStore();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isSignUp, setIsSignUp] = useState(false);

//   useEffect(() => {
//     initializeAuth();
//   }, [initializeAuth]);

//   const handleAuth = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isSignUp) {
//       await supabase.auth.signUp({ email, password });
//       alert("Check your email for the confirmation link!");
//     } else {
//       const { error } = await supabase.auth.signInWithPassword({ email, password });
//       if (error) alert(error.message);
//     }
//   };

//   if (isLoading) return <html lang="en"><body><div className="min-h-screen flex items-center justify-center">Loading...</div></body></html>;

//   // --- UNAUTHENTICATED VIEW (Login Screen) ---
//   if (!user) {
//     return (
//       <html lang="en">
//         <body className={`${inter.className} bg-veda-bg min-h-screen flex items-center justify-center`}>
//           <div className="bg-white p-8 rounded-xl shadow-paper max-w-md w-full">
//             <h1 className="text-2xl font-bold text-veda-orange mb-6 text-center">VedaAI</h1>
//             <h2 className="text-xl font-bold text-veda-dark mb-4">{isSignUp ? "Create an Account" : "Welcome Back"}</h2>
//             <form onSubmit={handleAuth} className="space-y-4">
//               <input 
//                 type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
//                 className="w-full p-3 border border-gray-200 rounded-lg focus:outline-veda-orange" 
//               />
//               <input 
//                 type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
//                 className="w-full p-3 border border-gray-200 rounded-lg focus:outline-veda-orange" 
//               />
//               <button type="submit" className="w-full bg-veda-dark text-white p-3 rounded-lg font-bold hover:bg-black transition-colors">
//                 {isSignUp ? "Sign Up" : "Sign In"}
//               </button>
//             </form>
//             <p className="mt-4 text-center text-sm text-veda-gray">
//               {isSignUp ? "Already have an account? " : "Don't have an account? "}
//               <button onClick={() => setIsSignUp(!isSignUp)} className="text-veda-orange font-bold">
//                 {isSignUp ? "Sign In" : "Sign Up"}
//               </button>
//             </p>
//           </div>
//         </body>
//       </html>
//     );
//   }

//   // --- AUTHENTICATED VIEW (The Layout We Built Earlier) ---
//   return (
//     <html lang="en">
//       <body className={`${inter.className} bg-veda-bg text-veda-dark min-h-screen flex`}>
//         {/* Your Sidebar goes here (from the previous code) */}
        
//         <main className="flex-1 flex flex-col min-w-0">
//           <header className="h-20 bg-veda-bg border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
//             <div className="text-sm font-medium text-veda-gray flex items-center gap-2">
//                <span>←</span> Assignments
//             </div>
//             <div className="flex items-center gap-4">
//               <button className="text-veda-gray hover:text-veda-dark">🔔</button>
//               <div className="flex items-center gap-2 text-sm font-medium cursor-pointer" onClick={() => useAuthStore.getState().signOut()}>
//                 <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">{user.email?.charAt(0).toUpperCase()}</div>
//                 <span className="hidden sm:inline">{user.email}</span> <span>⌄</span>
//               </div>
//             </div>
//           </header>
//           <div className="p-8 overflow-auto flex-1">
//              {children}
//           </div>
//         </main>
//       </body>
//     </html>
//   );
// }


// frontend/app/layout.tsx
"use client";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../lib/Supabase";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initializeAuth } = useAuthStore();
  
  // State for Email/Password Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handler for Email/Password
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Check your email for the confirmation link!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  // Handler for Google Auth
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}` 
      }
    });
    
    if (error) {
      console.error("Error logging in with Google:", error.message);
      alert(error.message);
    }
  };

  if (isLoading) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-veda-bg">
            <div className="w-8 h-8 border-4 border-veda-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
        </body>
      </html>
    );
  }

  // --- UNAUTHENTICATED VIEW (Combined Auth Screen) ---
  if (!user) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-veda-bg min-h-screen flex items-center justify-center p-4`}>
          <div className="bg-white p-8 rounded-2xl shadow-paper max-w-md w-full border border-gray-100">
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-veda-orange rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-md">
                V
              </div>
              <h1 className="text-2xl font-bold text-veda-dark mb-1">VedaAI</h1>
              <h2 className="text-lg font-semibold text-veda-gray">
                {isSignUp ? "Create an Account" : "Welcome Back"}
              </h2>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <input 
                type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-veda-orange text-sm" 
              />
              <input 
                type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-veda-orange text-sm" 
              />
              <button type="submit" className="w-full bg-veda-dark text-white p-3 rounded-lg font-bold hover:bg-black transition-colors text-sm">
                {isSignUp ? "Sign Up with Email" : "Sign In with Email"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-veda-gray">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-veda-orange font-bold hover:underline">
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-xs font-semibold text-gray-400 uppercase">Or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Login Button */}
            <button 
              onClick={handleGoogleLogin} 
              className="w-full bg-white border border-gray-200 text-veda-dark p-3 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            
          </div>
        </body>
      </html>
    );
  }

  // --- AUTHENTICATED VIEW (The Dashboard Layout) ---
  return (
    <html lang="en">
      <body className={`${inter.className} bg-veda-bg text-veda-dark min-h-screen flex`}>
        
        {/* Sidebar */}
       

        {/* Sidebar */}
        <aside className="w-64 bg-veda-sidebar border-r border-gray-100 flex flex-col justify-between hidden md:flex h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-10 text-2xl font-bold text-veda-orange">
              <div className="w-8 h-8 bg-veda-orange rounded-md flex items-center justify-center text-white text-sm">V</div>
              VedaAI
            </div>
            {/* 1. Update Create Button */}
            <button 
              onClick={() => useAssignmentStore.getState().setView('create')}
              className="w-full bg-veda-dark text-white rounded-full py-3 px-4 flex items-center justify-center gap-2 hover:bg-black transition-colors mb-8 shadow-md"
            >
              <span>✨</span> Create Assignment
            </button>
            <nav className="space-y-2 text-sm font-medium text-veda-gray">
              {/* 2. Update Home/History Buttons */}
              <button 
                onClick={() => useAssignmentStore.getState().setView('history')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                Dashboard History
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-20 bg-veda-bg border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="text-sm font-medium text-veda-gray flex items-center gap-2">
               <span>←</span> Assignments
            </div>
            <div className="flex items-center gap-4">
              <button className="text-veda-gray hover:text-veda-dark text-xl">🔔</button>
              
              {/* Profile Dropdown */}
              <div 
                className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors" 
                onClick={() => useAuthStore.getState().signOut()}
                title="Click to sign out"
              >
                {/* Avatar Logic: Google Image > Fallback Initials */}
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-veda-orange flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline">{user.user_metadata?.full_name || user.email}</span> 
                <span>⌄</span>
              </div>
            </div>
          </header>

          <div className="p-8 overflow-auto flex-1">
             {children}
          </div>
        </main>
      </body>
    </html>
  );
}