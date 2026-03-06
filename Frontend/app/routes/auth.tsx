import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "~/lib/api";
import { useAuth } from "~/hooks/useAuth";

const loginSchema = z.object({
  username: z.string().min(3, "Minim 3 caractere"),
  password: z.string().min(6, "Minim 6 caractere"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Minim 3 caractere"),
  password: z.string().min(6, "Minim 6 caractere"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginForm) => {
    setServerError("");
    setLoading(true);
    try {
      const response = await authApi.login(data);
      login(response);
      navigate("/dashboard");
    } catch (e: any) {
      setServerError(e?.response?.data?.message ?? "Credențiale incorecte.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setServerError("");
    setLoading(true);
    try {
      const response = await authApi.register({
        username: data.username,
        password: data.password,
      });
      login(response);
      navigate("/dashboard");
    } catch (e: any) {
      setServerError(e?.response?.data?.message ?? "Înregistrare eșuată. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">Licenta</h1>
          <p className="text-gray-400 mt-2">Platformă de management</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => { setTab("login"); setServerError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === "login"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Conectare
            </button>
            <button
              onClick={() => { setTab("register"); setServerError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === "register"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Creare cont
            </button>
          </div>

          <div className="p-8">
            {/* Server Error */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
                {serverError}
              </div>
            )}

            {/* LOGIN FORM */}
            {tab === "login" && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nume utilizator
                  </label>
                  <input
                    {...loginForm.register("username")}
                    placeholder="username"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="mt-1 text-xs text-red-400">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Parolă
                  </label>
                  <input
                    {...loginForm.register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-400">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {loading ? "Se conectează..." : "Conectare"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Nu ai cont?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Creează unul
                  </button>
                </p>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === "register" && (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nume utilizator
                  </label>
                  <input
                    {...registerForm.register("username")}
                    placeholder="username"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="mt-1 text-xs text-red-400">{registerForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Parolă
                  </label>
                  <input
                    {...registerForm.register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-400">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Confirmare parolă
                  </label>
                  <input
                    {...registerForm.register("confirmPassword")}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {loading ? "Se creează contul..." : "Creare cont"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Ai deja cont?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Conectează-te
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

