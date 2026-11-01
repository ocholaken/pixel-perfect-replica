import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

export const Route = createFileRoute("/signup")({ component: SignUp });

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const confirmation = String(form.get("confirmation") || "");
    const nextErrors: Record<string, string> = {};
    if (!name) nextErrors.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!phone) nextErrors.phone = "Enter your phone number.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!confirmation) nextErrors.confirmation = "Confirm your password.";
    else if (password !== confirmation) nextErrors.confirmation = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 700);
  };

  return <section className="section auth-section"><div className="account-card auth-card"><span className="eyebrow">Join Grace Patisserie</span><h1 className="page-title">Create Account</h1><p className="auth-intro">Create your customer profile for a sweeter checkout experience.</p>{success && <div className="notice" role="status">Your details have passed validation and are ready for secure backend registration. Account creation requires the Supabase connection to be enabled.</div>}<form onSubmit={submit} noValidate><div className="form-grid signup-grid"><label className="full">Full name<input className="form-control" name="name" autoComplete="name" aria-describedby="name-error" />{errors.name && <span id="name-error" className="field-error">{errors.name}</span>}</label><label> Email address<input className="form-control" name="email" type="email" autoComplete="email" aria-describedby="email-error" />{errors.email && <span id="email-error" className="field-error">{errors.email}</span>}</label><label> Phone number<input className="form-control" name="phone" type="tel" autoComplete="tel" aria-describedby="phone-error" />{errors.phone && <span id="phone-error" className="field-error">{errors.phone}</span>}</label><label className="full">Password<div className="password-control"><input className="form-control" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} aria-describedby="password-feedback password-error" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>{password && <div id="password-feedback" className={`password-strength strength-${strength}`}><span /><span /><span /><span /><small>{strength <= 1 ? "Weak" : strength <= 2 ? "Fair" : strength === 3 ? "Good" : "Strong"}</small></div>}{errors.password && <span id="password-error" className="field-error">{errors.password}</span>}</label><label className="full">Confirm password<div className="password-control"><input className="form-control" name="confirmation" type={showConfirmation ? "text" : "password"} autoComplete="new-password" aria-describedby="confirmation-error" /><button type="button" aria-label={showConfirmation ? "Hide confirmed password" : "Show confirmed password"} onClick={() => setShowConfirmation(value => !value)}>{showConfirmation ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>{errors.confirmation && <span id="confirmation-error" className="field-error">{errors.confirmation}</span>}</label></div><button className="btn btn-primary auth-submit" disabled={loading} type="submit">{loading ? "Validating..." : "Create Account"}</button></form><p className="auth-link">Already have an account? <Link to="/account">Sign In</Link></p><Link className="auth-home" to="/">← Return to homepage</Link></div></section>;
}
