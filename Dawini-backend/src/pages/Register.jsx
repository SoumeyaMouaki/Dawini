import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, User, Stethoscope, Pill, ArrowLeft, Mail, Lock, Phone, MapPin, Calendar, FileText, Navigation } from "lucide-react";
import api from "../api/axios.js";

// Validation schemas
const baseUserSchema = z.object({
  fullName: z.string().min(2, "Le nom complet doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  phone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 caractères"),
  address: z.object({
    wilaya: z.string().min(1, "La wilaya est requise"),
    commune: z.string().min(1, "La commune est requise"),
    street: z.string().optional(),
    postalCode: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  })
});

const patientSchema = baseUserSchema.extend({
  userType: z.literal("patient"),
  dateOfBirth: z.string().min(1, "La date de naissance est requise"),
  gender: z.enum(["male", "female", "other"]),
  nss: z.string().min(1, "Le numéro de sécurité sociale est requis")
});

const doctorSchema = baseUserSchema.extend({
  userType: z.literal("doctor"),
  nOrdre: z.string().min(1, "Le numéro d'ordre est requis"),
  specialization: z.string().min(1, "La spécialisation est requise"),
  biography: z.string().optional(),
  consultationFee: z.number().min(0, "Les frais de consultation ne peuvent pas être négatifs").optional()
});

const pharmacySchema = baseUserSchema.extend({
  userType: z.literal("pharmacist"),
  pharmacyName: z.string().min(1, "Le nom de la pharmacie est requis"),
  licenseNumber: z.string().min(1, "Le numéro de licence est requis")
});

const registerSchema = z.discriminatedUnion("userType", [
  patientSchema,
  doctorSchema,
  pharmacySchema
]);

export default function Register() {
  const [userType, setUserType] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "patient",
      address: {
        wilaya: "",
        commune: "",
        street: "",
        postalCode: "",
        coordinates: {
          lat: undefined,
          lng: undefined
        }
      }
    }
  });

  const watchedUserType = watch("userType");

  // Wilayas d'Algérie
  const wilayas = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
    "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
    "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
    "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
    "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj",
    "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
    "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane", "El M'Ghair", "El Meniaa", "Ouled Djellal", "Bordj Baji Mokhtar",
    "Béni Abbès", "Timimoun", "Touggourt", "Djanet", "In Salah", "In Guezzam"
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/register", data);
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Redirect based on user type
        switch (data.userType) {
          case "patient":
            navigate("/patient/dashboard");
            break;
          case "doctor":
            navigate("/doctor/dashboard");
            break;
          case "pharmacist":
            navigate("/pharmacy/dashboard");
            break;
          default:
            navigate("/");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur s'est produite lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserTypeChange = (newType) => {
    setUserType(newType);
    setValue("userType", newType);
    setError("");
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue("address.coordinates.lat", latitude);
        setValue("address.coordinates.lng", longitude);
        setIsGettingLocation(false);
        setLocationError("");
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("L'accès à la géolocalisation a été refusé");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Les informations de localisation ne sont pas disponibles");
            break;
          case error.TIMEOUT:
            setLocationError("La demande de localisation a expiré");
            break;
          default:
            setLocationError("Une erreur inconnue s'est produite");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
            Rejoignez Dawini
          </h1>
          <p className="text-lg text-secondary-600">
            Votre plateforme de santé numérique en Algérie
          </p>
        </div>

        {/* User Type Selection */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6 text-center">
            Choisissez votre profil
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: "patient", icon: User, label: "Patient", color: "primary", description: "Prenez rendez-vous et gérez votre santé" },
              { type: "doctor", icon: Stethoscope, label: "Médecin", color: "success", description: "Gérez vos patients et prescriptions" },
              { type: "pharmacist", icon: Pill, label: "Pharmacien", color: "warning", description: "Validez et délivrez les ordonnances" }
            ].map(({ type, icon: Icon, label, color, description }) => (
              <button
                key={type}
                type="button"
                onClick={() => handleUserTypeChange(type)}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${
                  userType === type
                    ? `border-${color}-500 bg-${color}-50 shadow-md`
                    : "border-secondary-200 hover:border-secondary-300 hover:shadow-sm"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors duration-200 ${
                    userType === type ? `bg-${color}-100` : "bg-secondary-100 group-hover:bg-secondary-200"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      userType === type ? `text-${color}-600` : "text-secondary-500 group-hover:text-secondary-600"
                    }`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    userType === type ? `text-${color}-700` : "text-secondary-700 group-hover:text-secondary-900"
                  }`}>
                    {label}
                  </h3>
                  <p className={`text-sm ${
                    userType === type ? `text-${color}-600` : "text-secondary-500 group-hover:text-secondary-600"
                  }`}>
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6 text-center">
            Informations personnelles
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom complet *
                </label>
                <input
                  type="text"
                  {...register("fullName")}
                  className={`input ${errors.fullName ? 'input-error' : ''}`}
                  placeholder="Votre nom complet"
                />
                {errors.fullName && (
                  <p className="text-error-600 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="label">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <p className="text-error-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary-400 hover:text-secondary-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="label">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className={`input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="0XX XX XX XX"
                />
                {errors.phone && (
                  <p className="text-error-600 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Adresse
                </h3>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="btn-outline btn-sm flex items-center"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {isGettingLocation ? "Localisation..." : "Utiliser ma position"}
                </button>
              </div>

              {locationError && (
                <div className="bg-warning-50 border border-warning-200 text-warning-700 px-4 py-3 rounded-lg">
                  {locationError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Wilaya *
                  </label>
                  <select
                    {...register("address.wilaya")}
                    className={`input ${errors.address?.wilaya ? 'input-error' : ''}`}
                  >
                    <option value="">Sélectionnez une wilaya</option>
                    {wilayas.map((wilaya) => (
                      <option key={wilaya} value={wilaya}>
                        {wilaya}
                      </option>
                    ))}
                  </select>
                  {errors.address?.wilaya && (
                    <p className="text-error-600 text-sm mt-1">{errors.address.wilaya.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Commune *
                  </label>
                  <input
                    type="text"
                    {...register("address.commune")}
                    className={`input ${errors.address?.commune ? 'input-error' : ''}`}
                    placeholder="Nom de la commune"
                  />
                  {errors.address?.commune && (
                    <p className="text-error-600 text-sm mt-1">{errors.address.commune.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Rue (optionnel)
                  </label>
                  <input
                    type="text"
                    {...register("address.street")}
                    className="input"
                    placeholder="Numéro et nom de rue"
                  />
                </div>

                <div>
                  <label className="label">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Code postal (optionnel)
                  </label>
                  <input
                    type="text"
                    {...register("address.postalCode")}
                    className="input"
                    placeholder="Code postal"
                  />
                </div>
              </div>
            </div>

            {/* Type-specific fields */}
            {userType === "patient" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="label">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    {...register("dateOfBirth")}
                    className={`input ${errors.dateOfBirth ? 'input-error' : ''}`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-error-600 text-sm mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <User className="w-4 h-4 inline mr-2" />
                    Genre *
                  </label>
                  <select
                    {...register("gender")}
                    className={`input ${errors.gender ? 'input-error' : ''}`}
                  >
                    <option value="">Sélectionnez</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                  {errors.gender && (
                    <p className="text-error-600 text-sm mt-1">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <FileText className="w-4 h-4 inline mr-2" />
                    NSS *
                  </label>
                  <input
                    type="text"
                    {...register("nss")}
                    className={`input ${errors.nss ? 'input-error' : ''}`}
                    placeholder="Numéro de sécurité sociale"
                  />
                  {errors.nss && (
                    <p className="text-error-600 text-sm mt-1">{errors.nss.message}</p>
                  )}
                </div>
              </div>
            )}

            {userType === "doctor" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Numéro d'ordre *
                  </label>
                  <input
                    type="text"
                    {...register("nOrdre")}
                    className={`input ${errors.nOrdre ? 'input-error' : ''}`}
                    placeholder="Numéro d'ordre médical"
                  />
                  {errors.nOrdre && (
                    <p className="text-error-600 text-sm mt-1">{errors.nOrdre.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <Stethoscope className="w-4 h-4 inline mr-2" />
                    Spécialisation *
                  </label>
                  <input
                    type="text"
                    {...register("specialization")}
                    className={`input ${errors.specialization ? 'input-error' : ''}`}
                    placeholder="ex: Cardiologie, Dermatologie..."
                  />
                  {errors.specialization && (
                    <p className="text-error-600 text-sm mt-1">{errors.specialization.message}</p>
                  )}
                </div>
              </div>
            )}

            {userType === "pharmacist" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <Pill className="w-4 h-4 inline mr-2" />
                    Nom de la pharmacie *
                  </label>
                  <input
                    type="text"
                    {...register("pharmacyName")}
                    className={`input ${errors.pharmacyName ? 'input-error' : ''}`}
                    placeholder="Nom de votre pharmacie"
                  />
                  {errors.pharmacyName && (
                    <p className="text-error-600 text-sm mt-1">{errors.pharmacyName.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Numéro de licence *
                  </label>
                  <input
                    type="text"
                    {...register("licenseNumber")}
                    className={`input ${errors.licenseNumber ? 'input-error' : ''}`}
                    placeholder="Numéro de licence pharmaceutique"
                  />
                  {errors.licenseNumber && (
                    <p className="text-error-600 text-sm mt-1">{errors.licenseNumber.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Hidden userType field */}
            <input type="hidden" {...register("userType")} />

            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn w-full btn-lg"
            >
              {isLoading ? "Création du compte..." : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-secondary-600">
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="link font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
