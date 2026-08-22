import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../lib/store";
import { IGoogle, ILock, ILogo, IMail, IStar, IUsers } from "../components/icons";

type Mode = "signin" | "signup";

export default function Auth() {
  const { login, signup, loginGoogle } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/";

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === "signup" && name.trim().length < 2) errs.name = "Tell us your name — hosts like to know who's coming.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "That doesn't look like an email address.";
    if (pw.length < 8) errs.pw = "Passwords need at least 8 characters.";
    if (mode === "signup" && pw2 !== pw) errs.pw2 = "Those passwords don't match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const err = mode === "signin" ? login(email, pw) : signup(name, email, pw);
    if (err) {
      setErrors({ form: err });
      return;
    }
    navigate(next, { replace: true });
  };

  const google = () => {
    setGoogleLoading(true);
    window.setTimeout(() => {
      loginGoogle();
      navigate(next, { replace: true });
    }, 750);
  };

  const fill = (e2: string, p: string) => {
    setMode("signin");
    setEmail(e2);
    setPw(p);
    setErrors({});
  };

  const field = "w-full rounded-lg border border-line bg-paper px-4 py-3 pl-11 text-[15px] font-medium outline-none transition focus:border-pine-600 focus:ring-2 focus:ring-pine-200";

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
      {/* form side */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <ILogo className="h-10 w-10 lg:hidden" />
          <h1 className="mt-6 font-display text-[34px] font-semibold leading-tight tracking-tight text-pine-950 lg:mt-0">
            <span className="mask-line"><span>{mode === "signin" ? "Welcome back to the highlands." : "Pitch your tent here."}</span></span>
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            {mode === "signin"
              ? "Sign in to book stays, save favourites and manage your listings."
              : "One account for booking trips and hosting stays — free to join."}
          </p>

          {/* tabs */}
          <div className="mt-7 grid grid-cols-2 rounded-full border border-line bg-parch p-1">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={`rounded-full py-2.5 text-sm font-bold transition-all duration-300 ${
                  mode === m ? "bg-pine-800 text-paper shadow" : "text-ink-soft hover:text-ink"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft">FULL NAME</label>
                <div className="relative">
                  <IUsers className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pine-600" />
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Robin Saltmarsh" className={field} />
                </div>
                {errors.name && <p className="mt-1 text-xs font-semibold text-ember-600">{errors.name}</p>}
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft">EMAIL</label>
              <div className="relative">
                <IMail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pine-600" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@somewhere.sea" className={field} />
              </div>
              {errors.email && <p className="mt-1 text-xs font-semibold text-ember-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="pw" className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft">PASSWORD</label>
              <div className="relative">
                <ILock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pine-600" />
                <input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••••" className={field} />
              </div>
              {errors.pw && <p className="mt-1 text-xs font-semibold text-ember-600">{errors.pw}</p>}
            </div>
            {mode === "signup" && (
              <div>
                <label htmlFor="pw2" className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft">CONFIRM PASSWORD</label>
                <div className="relative">
                  <ILock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pine-600" />
                  <input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••••" className={field} />
                </div>
                {errors.pw2 && <p className="mt-1 text-xs font-semibold text-ember-600">{errors.pw2}</p>}
              </div>
            )}

            {errors.form && (
              <p className="rounded-lg border border-ember-500/30 bg-[#fbeee9] px-4 py-3 text-sm font-semibold text-ember-600">{errors.form}</p>
            )}

            <button type="submit" className="w-full rounded-xl bg-pine-800 py-3.5 text-[15px] font-bold text-paper shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-pine-700 hover:shadow-float">
              {mode === "signin" ? "Sign in" : "Create your account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs font-bold tracking-widest text-ink-soft">OR</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={google}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-paper py-3.5 text-[15px] font-bold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-pine-300 hover:shadow-lift disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-pine-300 border-t-pine-700" />
            ) : (
              <IGoogle className="h-5 w-5" />
            )}
            {googleLoading ? "Contacting Google…" : "Continue with Google"}
          </button>

          {/* demo accounts */}
          <div className="mt-6 rounded-xl border border-dashed border-pine-300 bg-pine-50/60 p-4">
            <p className="text-xs font-bold tracking-widest text-pine-700">DEMO ACCOUNTS — ONE CLICK</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => fill("host@haven.demo", "buna-gebeta-8")} className="rounded-full border border-pine-300 bg-paper px-4 py-2 text-xs font-bold text-pine-800 transition hover:bg-pine-800 hover:text-paper">
                Meron · Superhost
              </button>
              <button onClick={() => fill("traveler@haven.demo", "teff-injera-4")} className="rounded-full border border-pine-300 bg-paper px-4 py-2 text-xs font-bold text-pine-800 transition hover:bg-pine-800 hover:text-paper">
                Yonas · Traveller
              </button>
            </div>
            <p className="mt-2 text-xs text-ink-soft">Click to autofill, then hit Sign in. In production this is JWT + httpOnly refresh cookies — see <code className="font-mono text-[11px] text-pine-700">blueprint/</code>.</p>
          </div>
        </div>
      </div>

      {/* image side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://image.qwenlm.ai/generated-images/19af859e-08df-48ad-83d7-79f809c92d7c/_result.png"
          alt="Chamo Shore House above the water at Arba Minch"
          className="kenburns h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pine-950/85 via-pine-950/25 to-pine-950/10" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <p className="font-display text-3xl font-medium leading-snug text-paper xl:text-4xl">
            "Crocodiles at noon, pink skies over the lake<br /> at dinner. We extended twice."
          </p>
          <p className="mt-3 text-sm font-semibold tracking-wide text-marigold-300">— AMARA, STAYED AT CHAMO SHORE HOUSE</p>
          <div className="mt-8 flex gap-8 border-t border-paper/25 pt-6 text-paper">
            <span className="flex items-center gap-2 text-sm font-semibold"><IStar className="h-4 w-4 text-marigold-400" /> 4.91 average rating</span>
            <span className="flex items-center gap-2 text-sm font-semibold"><IUsers className="h-4 w-4 text-marigold-400" /> 2,300+ hosted nights</span>
          </div>
        </div>
      </div>
    </div>
  );
}
