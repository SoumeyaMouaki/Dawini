import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar, User, Stethoscope, Pill, Shield, Clock, Star, ArrowRight } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ specialty, location, date });
    navigate(`/patient/dashboard?${params.toString()}`);
  };

  const features = [
    {
      icon: Stethoscope,
      title: t('hero.features.findDoctor.title'),
      description: t('hero.features.findDoctor.description'),
      color: "primary",
      href: "/patient/dashboard"
    },
    {
      icon: Pill,
      title: t('hero.features.prescriptions.title'),
      description: t('hero.features.prescriptions.description'),
      color: "success",
      href: "/patient/prescriptions"
    },
    {
      icon: Shield,
      title: t('hero.features.pharmacies.title'),
      description: t('hero.features.pharmacies.description'),
      color: "warning",
      href: "/pharmacy/dashboard"
    }
  ];

  const stats = [
    { number: "500+", label: t('hero.stats.doctors') },
    { number: "50+", label: t('hero.stats.specialties') },
    { number: "1000+", label: t('hero.stats.patients') },
    { number: "24/7", label: t('hero.stats.support') }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-primary-700/90 to-primary-800/90"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-12 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>

            {/* Search Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
              <form onSubmit={onSearch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={t('hero.search.specialty')}
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="input pl-12"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={t('hero.search.location')}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input pl-12"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="input pl-12"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-lg w-full md:w-auto">
                  <Search className="w-5 h-5 mr-2" />
                  {t('actions.search')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-secondary-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              {t('hero.features.title')}
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              {t('hero.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group card-hover text-center cursor-pointer"
                  onClick={() => navigate(feature.href)}
                >
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-${feature.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-8 h-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-center text-primary-600 font-medium group-hover:text-primary-700">
                    {t('hero.features.learnMore')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('hero.cta.title')}
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            {t('hero.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="btn btn-lg bg-white text-primary-600 hover:bg-primary-50"
            >
              <User className="w-5 h-5 mr-2" />
              {t('hero.cta.createAccount')}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600"
            >
              {t('actions.login')}
            </button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
              {t('hero.trust.title')}
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-success-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-success-600" />
              </div>
              <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                {t('hero.trust.security.title')}
              </h4>
              <p className="text-secondary-600">
                {t('hero.trust.security.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                {t('hero.trust.availability.title')}
              </h4>
              <p className="text-secondary-600">
                {t('hero.trust.availability.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-warning-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-warning-600" />
              </div>
              <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                {t('hero.trust.verified.title')}
              </h4>
              <p className="text-secondary-600">
                {t('hero.trust.verified.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
