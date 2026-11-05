import { CheckCircle2, Clock3, Loader2, Mail, MapPin, MessageSquare, Phone, Send, ShieldCheck, Star, Truck, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_URL = "https://wa.me/254713380906?text=Hello%20Grace%20Patisserie!%20I%20have%20a%20question%20about%20your%20cakes.";

type FieldErrors = { name?: string; email?: string; message?: string };

export function FooterContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const validate = (field: "name" | "email" | "message") => {
    if (field === "name") setErrors((current) => ({ ...current, name: name.trim() ? undefined : "Please enter your full name." }));
    if (field === "email") setErrors((current) => ({ ...current, email: !email.trim() ? "Please enter your email address." : !EMAIL_PATTERN.test(email.trim()) ? "Please enter a valid email address." : undefined }));
    if (field === "message") setErrors((current) => ({ ...current, message: message.trim().length >= 3 ? undefined : "Please write a little more so we can help you." }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {
      name: name.trim() ? undefined : "Please enter your full name.",
      email: !email.trim() ? "Please enter your email address." : !EMAIL_PATTERN.test(email.trim()) ? "Please enter a valid email address." : undefined,
      message: message.trim().length >= 3 ? undefined : "Please write a little more so we can help you.",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      status: "unread",
    });
    setSending(false);
    if (error) {
      console.error("Grace Patisserie message submission failed:", error);
      toast.error(error.message || "We could not send your message. Please try again.");
      return;
    }
    setSubmittedName(name.trim());
    setSubmittedEmail(email.trim().toLowerCase());
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setErrors({});
  };

  const contactCards = [
    { icon: MapPin, title: "Our Atelier", content: "Eldoret, Rift Valley, Kenya" },
    { icon: Phone, title: "Call Us", content: "0713 380 906", href: "tel:+254713380906" },
    { icon: Mail, title: "Email Us", content: "hello@gracepatisserie.co.ke", href: "mailto:hello@gracepatisserie.co.ke" },
    { icon: Clock3, title: "Atelier Hours", content: "Mon - Sat: 8:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM" },
  ];

  return (
    <section id="contact" className="relative overflow-hidden border-t border-[#C9A86A]/60 bg-[#1A120B] text-white" style={{ backgroundImage: "radial-gradient(circle at 15% 20%, rgba(201,168,106,.16), transparent 30%), radial-gradient(circle at 85% 70%, rgba(201,168,106,.09), transparent 26%)" }}>
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "repeating-linear-gradient(45deg,#C9A86A 0,#C9A86A 1px,transparent 1px,transparent 18px)" }} />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="mb-14 flex items-center gap-4 text-[#C9A86A]"><span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C9A86A]" /><span className="whitespace-nowrap text-xs tracking-[0.3em]">✦ GRACE PATISSERIE ✦</span><span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C9A86A]" /></div>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#C9A86A]">GRACE PATISSERIE • ELDORET ATELIER</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Let's Create Something Unforgettable</h2>
            <div className="mt-7 flex items-center gap-3 text-[#C9A86A]"><span className="h-px w-[60px] bg-[#C9A86A]" /><span>✦</span></div>
            <p className="mt-6 max-w-xl leading-7 text-[#D6C7B0]">Every cake is a work of art. Visit our atelier, call us, or send a message below. Our master bakers reply within 1 hour during working hours.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {contactCards.map(({ icon: Icon, title, content, href }) => {
                const inner = <><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#C9A86A]/30 bg-[#C9A86A]/10"><Icon size={19} className="text-[#C9A86A]" /></span><span><strong className="block text-sm text-white">{title}</strong><span className="mt-1 block text-sm leading-5 text-[#D6C7B0]">{content}</span></span></>;
                return href ? <a key={title} href={href} className="flex items-center gap-4 rounded-[18px] border border-[#C9A86A]/20 bg-white/[0.04] p-4 backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#C9A86A]">{inner}</a> : <div key={title} className="flex items-center gap-4 rounded-[18px] border border-[#C9A86A]/20 bg-white/[0.04] p-4 backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#C9A86A]">{inner}</div>;
              })}
            </div>
            <div className="mt-7 flex flex-wrap gap-2 text-xs text-[#D6C7B0]">
              {[{ icon: ShieldCheck, label: "Trusted Atelier" }, { icon: Star, label: "4.9 Rated" }, { icon: Truck, label: "Same-Day Delivery in Eldoret" }].map(({ icon: Icon, label }) => <span key={label} className="flex items-center gap-2 rounded-full border border-[#C9A86A]/20 px-3 py-2"><Icon size={15} className="text-[#C9A86A]" />{label}</span>)}
            </div>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-7 inline-flex h-12 items-center justify-center rounded-full border border-[#C9A86A] px-7 text-sm font-semibold text-[#E5C989] transition hover:bg-[#C9A86A] hover:text-[#1A120B]">Chat on WhatsApp</a>
          </div>

          <div className="rounded-[28px] border border-[#C9A86A]/30 bg-[#FFF8F0] p-6 text-[#2B2118] shadow-[0_30px_60px_rgba(0,0,0,.4)] sm:p-8">
            {sent ? (
              <div className="flex min-h-[480px] flex-col items-center justify-center text-center" role="status">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-[#DCFCE7] text-[#166534] shadow-[0_0_0_10px_rgba(201,168,106,.12)]"><CheckCircle2 size={38} /></span>
                <p className="mt-8 text-xs font-bold tracking-[0.3em] text-[#C9A86A]">PRIVATE MESSAGE</p>
                <h3 className="mt-3 font-serif text-3xl">Message Received, {submittedName}!</h3>
                <p className="mt-4 max-w-md leading-7 text-[#756858]">Thank you for reaching out. Our atelier will reply to <strong>{submittedEmail}</strong> within 1 hour.</p>
                <button type="button" onClick={() => setSent(false)} className="mt-7 rounded-full border border-[#C9A86A] px-6 py-3 text-sm font-bold text-[#80601F]">Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className="text-xs font-bold tracking-[0.3em] text-[#C9A86A]">PRIVATE MESSAGE</p>
                <h3 className="mt-3 font-serif text-3xl" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Send Us A Message</h3>
                <p className="mt-2 text-sm text-[#756858]">We reply personally, not by robot.</p>
                <div className="mt-7 space-y-5">
                  <label className="block text-xs font-bold text-[#594A39]">Full Name<div className="relative mt-2"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A88B4F]" /><input value={name} onBlur={() => validate("name")} onChange={(event) => setName(event.target.value)} placeholder="Kenneth Ochola" aria-invalid={Boolean(errors.name)} className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A86A] focus:ring-2 focus:ring-[#C9A86A]/20 ${errors.name ? "border-red-500" : "border-[#E8D5B5]"}`} /></div>{errors.name && <span className="mt-1.5 block text-xs text-red-600">{errors.name}</span>}</label>
                  <label className="block text-xs font-bold text-[#594A39]">Email<div className="relative mt-2"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A88B4F]" /><input type="email" value={email} onBlur={() => validate("email")} onChange={(event) => setEmail(event.target.value)} placeholder="ocholakenna1@gmail.com" aria-invalid={Boolean(errors.email)} className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A86A] focus:ring-2 focus:ring-[#C9A86A]/20 ${errors.email ? "border-red-500" : "border-[#E8D5B5]"}`} /></div>{errors.email && <span className="mt-1.5 block text-xs text-red-600">{errors.email}</span>}</label>
                  <label className="block text-xs font-bold text-[#594A39]">Message<div className="relative mt-2"><MessageSquare size={18} className="absolute left-4 top-4 text-[#A88B4F]" /><textarea value={message} onBlur={() => validate("message")} onChange={(event) => setMessage(event.target.value)} rows={4} placeholder="Write your message... e.g. I want a birthday cake for Saturday" aria-invalid={Boolean(errors.message)} className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#C9A86A] focus:ring-2 focus:ring-[#C9A86A]/20 ${errors.message ? "border-red-500" : "border-[#E8D5B5]"}`} /></div>{errors.message && <span className="mt-1.5 block text-xs text-red-600">{errors.message}</span>}</label>
                </div>
                <button disabled={sending} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A86A] to-[#A88B4F] font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70">{sending ? <><Loader2 size={18} className="animate-spin" />Sending...</> : <>Send Message <Send size={18} /></>}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
