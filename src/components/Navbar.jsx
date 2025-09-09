import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Menu, X, User, Stethoscope, Pill, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import LanguageSwitch from "./LanguageSwitch.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const linkClass = "text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-primary-50";

  const getUserRoleInfo = () => {
    if (!user) return null;
    
    switch (user.userType) {
      case 'patient':
        return {
          icon: User,
          label: 'Patient',
          color: 'primary',
          dashboardPath: '/patient/dashboard'
        };
      case 'doctor':
        return {
          icon: Stethoscope,
          label: 'Médecin',
          color: 'success',
          dashboardPath: '/doctor/dashboard'
        };
      case 'pharmacist':
        return {
          icon: Pill,
          label: 'Pharmacien',
          color: 'warning',
          dashboardPath: '/pharmacy/dashboard'
        };
      default:
        return null;
    }
  };

  const roleInfo = getUserRoleInfo();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-700 transition-colors duration-200">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-2xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors duration-200">
              Dawini
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={linkClass}>
              Accueil
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              À propos
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>

            {/* Role-based navigation */}
            {!user && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-secondary-200">
                <button
                  onClick={() => navigate("/register")}
                  className="btn btn-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  S'inscrire
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-outline btn-sm"
                >
                  Se connecter
                </button>
              </div>
            )}

            {user && roleInfo && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-secondary-200">
                <NavLink
                  to={roleInfo.dashboardPath}
                  className={`${linkClass} flex items-center gap-2`}
                >
                  <roleInfo.icon className="w-4 h-4" />
                  Mon tableau de bord
                </NavLink>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary-50 transition-colors duration-200"
                  >
                    <div className={`w-8 h-8 rounded-full bg-${roleInfo.color}-100 flex items-center justify-center`}>
                      <roleInfo.icon className={`w-4 h-4 text-${roleInfo.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-secondary-700">
                      {user.fullName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-secondary-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-secondary-100">
                        <p className="text-sm font-medium text-secondary-900">{user.fullName}</p>
                        <p className="text-xs text-secondary-500">{roleInfo.label}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Language Switcher */}
            <div className="ml-2">
              <LanguageSwitch />
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitch />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-secondary-100 py-4">
            <nav className="space-y-2">
              <NavLink
                to="/"
                className="block px-3 py-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </NavLink>
              <NavLink
                to="/about"
                className="block px-3 py-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </NavLink>
              <NavLink
                to="/contact"
                className="block px-3 py-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </NavLink>

              {!user ? (
                <div className="pt-4 border-t border-secondary-100 space-y-2">
                  <button
                    onClick={() => {
                      navigate("/register");
                      setIsMenuOpen(false);
                    }}
                    className="w-full btn btn-sm"
                  >
                    <User className="w-4 h-4 mr-2" />
                    S'inscrire
                  </button>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="w-full btn-outline btn-sm"
                  >
                    Se connecter
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-secondary-100 space-y-2">
                  {roleInfo && (
                    <NavLink
                      to={roleInfo.dashboardPath}
                      className="flex items-center gap-2 px-3 py-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <roleInfo.icon className="w-4 h-4" />
                      Mon tableau de bord
                    </NavLink>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
