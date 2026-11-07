import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import { isAdmin } from "../lib/admin";
export function Account() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useRouterState({ select: (state) => state.location });
  const from = (location.state as { from?: { pathname?: string; href?: string } } | undefined)?.from;
  const signupSuccess = (location.state as { signupSuccess?: boolean } | undefined)?.signupSuccess;
  const [authError, setAuthError] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState<string>("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const search = location.search as { verified?: boolean | string; exists?: boolean | string; reset?: boolean | string; created?: boolean | string };
  const created = search.created === true || search.created === "true";

  useEffect(() => {
    if (search.verified !== true && search.verified !== "true") return;
    const email = String(emailValue || sessionStorage.getItem("pendingEmail") || "").trim().toLowerCase();
    const timer = window.setTimeout(() => {
      navigate({ to: isAdmin(email) ? "/admin" : "/" });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [emailValue, navigate, search.verified]);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(emailValue || "").trim().toLowerCase();
    const password = String(passwordValue || "");

    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setAuthError("");
    setLoginSuccess("");
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const message = String(error.message || "");
        const humanMessage = message.toLowerCase().includes("invalid login")
          ? "Invalid email or password. Check email or click Forgot Password."
          : "Invalid email or password. Check email or click Forgot Password.";
        setAuthError(humanMessage);
        toast.error(humanMessage);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", authData.user.id).maybeSingle();
      const pendingEmail = sessionStorage.getItem("pendingEmail")?.trim().toLowerCase();
      const firstSweetSerenityLogin = pendingEmail === email;
      if (firstSweetSerenityLogin) {
        sessionStorage.setItem("ss-login-greeting", "first");
        sessionStorage.removeItem("pendingEmail");
        sessionStorage.removeItem("pendingName");
      } else {
        sessionStorage.setItem("ss-login-greeting", "returning");
      }
      const welcomeMessage = firstSweetSerenityLogin
        ? `Welcome to Sweet Serenity${profile?.full_name ? `, ${profile.full_name.split(/\s+/)[0]}` : ""}!`
        : "Welcome back to Sweet Serenity!";
      toast.success(welcomeMessage);
      setLoginSuccess(`${welcomeMessage} Redirecting to your atelier...`);
      document.body.style.opacity = "1";
      window.setTimeout(() => {
        document.body.style.opacity = "0";
      }, 50);
      window.setTimeout(() => {
        if (profile?.role === "admin" || isAdmin(authData.user.email)) window.location.href = "/admin";
        else if (from?.pathname || from?.href) window.location.href = from.pathname || from.href || "/account";
        else window.location.href = "/account";
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setAuthError(`Error: ${message}`);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    navigate({ to: "/forgot-password" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fefaf3]">Loading...</div>;

  if (!loggedIn) return (
    <main className="min-h-screen bg-[#fefaf3] flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #f9e8c9 0%, #fefaf3 40%, #fdf6e7 100%)" }}>
      <div className="absolute top-[-50px] right-[-50px] w-[400px] h-[400px] rounded-full bg-[#c9a86a]/20 blur-[80px]" />
      <div className="absolute top-0 right-[15%] w-20 h-20 rounded-full bg-[#c9a86a]/20 blur-sm" />
      <div className="absolute top-[10%] right-[8%] w-8 h-8 rounded-full border border-[#c9a86a]/30" />
      <div className="absolute bottom-[20%] left-[10%] w-32 h-32 rounded-full bg-[#f9e8c9] border border-[#c9a86a]/20" />

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} onSubmit={signIn} className="relative w-full max-w-[480px] bg-[#fffffe]/95 backdrop-blur-xl border border-[#e8d5b5] border-t-[3px] border-t-[#c9a86a] rounded-[32px] shadow-[0_25px_80px_rgba(201,168,106,0.18)] p-8 md:p-10">
        <p className="text-center text-[11px] tracking-[0.4em] text-[#c9a86a] font-semibold mb-6">SWEET SERENITY</p>
        <h1 className="font-serif text-[42px] font-normal text-black text-center leading-none tracking-tight">Welcome Back</h1>
        <p className="text-center text-[14px] text-[#6b6b6b] mt-3">Sign in to your sweet sanctuary</p>
        <div className="mx-auto mt-5 w-16 h-[1px] bg-[#c9a86a]/50" />
        {(search.verified === true || search.verified === "true") && <div className="mt-6 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700" role="status">Account verified! Welcome to Sweet Serenity.</div>}
        {(search.exists === true || search.exists === "true") && <div className="mt-6 rounded-[14px] border border-[#e8d5b5] bg-[#fefaf3] px-4 py-3 text-center text-sm font-medium text-black" role="status">This email already has an account. Please login.</div>}
        {(search.reset === true || search.reset === "true") && <div className="mt-6 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700" role="status">Password reset successfully. Please login.</div>}
        {signupSuccess && <div className="mt-6 rounded-[14px] border border-[#e8d5b5] bg-[#fefaf3] px-4 py-3 text-center text-sm font-medium text-black" role="status">Account created successfully. You can now sign in.</div>}
        {created && <div className="mt-6 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700" role="status">Account created! Please login.</div>}
        {loginSuccess && <div className="mt-6 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700" role="status">{loginSuccess}</div>}
        {authError && <div className="mt-6 rounded-[14px] border border-[#e8d5b5] bg-[#fefaf3] px-4 py-3 text-center text-sm text-black" role="alert">{authError}</div>}
        {authError && <Link to="/signup" className="block mt-3 text-center text-[13px] font-medium text-[#c9a86a] underline underline-offset-4">Create new atelier account</Link>}

        <div className="mt-8 space-y-5">
          <div>
            <label htmlFor="account-email" className="block text-center text-[11px] tracking-[0.15em] font-bold text-black uppercase mb-2.5">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a86a]/60" />
              <input id="account-email" name="email" type="email" autoComplete="email" value={emailValue} onChange={(event) => setEmailValue(event.target.value)} className={`w-full bg-white text-black placeholder:text-gray-400 border-[1.5px] ${authError ? "border-red-300" : "border-[#d4b77a]/60"} focus:border-[#c9a86a] focus:ring-4 focus:ring-[#c9a86a]/10 rounded-[14px] pl-12 pr-4 py-3.5 text-[15px] outline-none transition-all`} placeholder="you@email.com" />
            </div>
          </div>
          <div>
            <label htmlFor="account-password" className="block text-center text-[11px] tracking-[0.15em] font-bold text-black uppercase mb-2.5">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a86a]/60" />
              <input id="account-password" name="password" type="password" autoComplete="current-password" value={passwordValue} onChange={(event) => setPasswordValue(event.target.value)} className="w-full bg-white text-black placeholder:text-gray-400 border-[1.5px] border-[#d4b77a]/60 focus:border-[#c9a86a] focus:ring-4 focus:ring-[#c9a86a]/10 rounded-[14px] pl-12 pr-4 py-3.5 text-[15px] outline-none" placeholder="••••••••" />
            </div>
            <div className="flex justify-end mt-2.5"><button type="button" onClick={resetPassword} className="text-[13px] text-black font-medium underline decoration-[#c9a86a] underline-offset-4 decoration-2">Forgot password</button></div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-b from-[#d4b77a] to-[#c9a86a] hover:from-[#c9a86a] hover:to-[#b8955a] text-white font-serif text-[15px] tracking-[0.15em] py-[15px] rounded-[14px] shadow-[0_10px_25px_rgba(201,168,106,0.35)] transition-all duration-300 hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70">{loading ? "SIGNING IN..." : "SIGN IN"}</button>
          <div className="flex items-center gap-4 py-2"><div className="h-[1px] flex-1 bg-[#e8d5b5]" /><span className="text-[12px] tracking-widest text-gray-400">OR</span><div className="h-[1px] flex-1 bg-[#e8d5b5]" /></div>
          <p className="text-center text-[14px] text-black"><span className="font-medium">New to Sweet Serenity?</span><br /><Link to="/signup" className="font-medium text-[#c9a86a] underline decoration-[#c9a86a] underline-offset-4">Create an atelier account</Link></p>
        </div>
      </motion.form>
    </main>
  );

  return <section className="section"><div className="account-card"><h1 className="page-title">My Orders</h1><p>Order history appears here after your account is connected to Supabase and sign-in is verified.</p><div className="notice">No orders have been placed for this account yet.</div><button className="btn" onClick={() => setLoggedIn(false)}>Sign Out</button></div></section>;
}
