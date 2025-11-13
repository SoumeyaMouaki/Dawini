import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar, User, Stethoscope, Pill, Shield, Star, ArrowRight, Filter, X, Clock, Clock3, Navigation, Loader2 } from "lucide-react";
import SearchSuggestions from '../components/SearchSuggestions.jsx';

export default function Home() {
  const { t } = useTranslation();
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [urgency, setUrgency] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();


  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Reverse geocoding to get address
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`)
          .then(response => response.json())
          .then(data => {
            if (data.city && data.principalSubdivision) {
              setLocation(`${data.city}, ${data.principalSubdivision}`);
            }
          })
          .catch(error => {
            console.error('Error getting address:', error);
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          })
          .finally(() => {
            setIsLocating(false);
          });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Impossible d\'obtenir votre localisation. Veuillez entrer manuellement votre ville.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const onSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    // Add specialization search
    if (specialty) {
      params.set('specialization', specialty);
    }
    
    if (location) {
      if (userLocation) {
        // If we have coordinates, use them for more accurate search
        params.set('lat', userLocation.lat);
        params.set('lng', userLocation.lng);
      } else {
        // Fallback to text-based location search
        const [wilaya, commune] = location.split(',').map(s => s.trim());
        if (wilaya) params.set('wilaya', wilaya);
        if (commune) params.set('commune', commune);
      }
    }
    
    if (date) params.set('date', date);
    if (urgency) params.set('urgency', urgency);
    if (consultationType) params.set('type', consultationType);
    
    navigate(`/search?${params.toString()}`);
  };

  const clearSearch = () => {
    setSpecialty("");
    setLocation("");
    setDate("");
    setUrgency("");
    setConsultationType("");
    setUserLocation(null);
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
      <section className="relative bg-[#007BBD] text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            {/* Texte + Formulaire */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl text-primary-200 font-extrabold leading-tight mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-blue-100 font-medium mb-10">
                {t('hero.subtitle')}
              </p>

              {/* Search Form - Style Doctolib Unifié */}
              <div className="flex rounded-3xl shadow-lg border border-gray-200 overflow-visible bg-transparent">
                <form onSubmit={onSearch} className="space-y-4">
                  {/* Barre de recherche unifiée - Style Doctolib */}
                  <div className="flex bg-white rounded-3xl shadow-lg border border-gray-200 overflow-visible">
                    
                    {/* Champ de spécialité - Gauche */}
                    <div className="flex-1 relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#007BBD] transition-colors duration-200" />
                      </div>
                      <SearchSuggestions
                        searchType="specialty"
                        value={specialty}
                        onSelect={setSpecialty}
                        placeholder="Ophtalmologue"
                        icon={null}
                        className="w-full pl-14 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none text-base font-medium"
                      />
                    </div>

                    {/* Séparateur vertical */}
                    <div className="w-px bg-gray-200"></div>

                    {/* Champ de localisation - Centre */}
                    <div className="flex-1 relative group">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none z-10">
                        <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-[#007BBD] transition-colors duration-200" />
                      </div>
                      <SearchSuggestions
                        searchType="location"
                        value={location}
                        onSelect={setLocation}
                        placeholder="Alger"
                        icon={null}
                        className="w-full pl-14 pr-12 py-4 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none text-base font-medium"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isLocating}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#007BBD] transition-colors duration-200 z-20"
                        title="Me localiser"
                      >
                        {isLocating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Bouton de recherche - Droite */}
                    <button
                      type="submit"
                      className="bg-sky-900 hover:bg-[#005a8b] rounded-r-3xl text-white px-8 py-4 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px]"
                    >
                      Rechercher
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  
                </form>
              </div>
            </div>

            {/* Image à droite */}
            <div className="flex justify-center lg:justify-end">
              <img 
                src="/bg5.png" 
                alt="Doctor" 
                className="absolute right-[-200px] bottom-0 max-h-[500px] w-auto object-contain animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-[#007BBD] mb-2 group-hover:scale-110 transition-transform duration-200">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium group-hover:text-gray-800 transition-colors duration-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
              Nos Services
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Des solutions complètes pour votre santé
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre gamme de services médicaux conçus pour répondre à tous vos besoins de santé
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 text-center">
                    <button className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200 flex items-center justify-center mx-auto">
                      En savoir plus
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-700/90" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('hero.cta.title')}
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              {t('hero.cta.subtitle')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-primary-50 transition-all duration-200 flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              <User className="w-6 h-6 mr-3" />
              {t('hero.cta.createAccount')}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-200 font-semibold text-lg"
            >
              {t('actions.login')}
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-primary-100">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm">Sécurisé</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm">24/7</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              <span className="text-sm">Fiable</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
              Pourquoi nous choisir
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              {t('hero.trust.title')}
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous nous engageons à fournir des services médicaux de la plus haute qualité
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                {t('hero.trust.security.title')}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {t('hero.trust.security.description')}
              </p>
            </div>
            <div className="group text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                {t('hero.trust.availability.title')}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {t('hero.trust.availability.description')}
              </p>
            </div>
            <div className="group text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star className="w-10 h-10 text-yellow-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                {t('hero.trust.verified.title')}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {t('hero.trust.verified.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}