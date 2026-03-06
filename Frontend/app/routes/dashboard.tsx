import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth");
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Licenta</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user.username}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
            user.role === "ADMIN" ? "bg-indigo-900 text-indigo-300" : "bg-gray-800 text-gray-300"
          }`}>
            {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Deconectare
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Bun venit, {user.username}! 👋
          </h2>
          <p className="text-gray-400">Ești autentificat cu succes.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Utilizator</p>
              <p className="text-lg font-semibold text-white">{user.username}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-lg font-semibold text-white">{user.email}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rol</p>
              <p className="text-lg font-semibold text-white">{user.role}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

