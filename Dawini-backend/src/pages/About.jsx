import { useTranslation } from 'react-i18next'
import { Heart, Shield, Users, Clock, Star, ArrowRight, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const features = [
    {
      icon: Users,
      title: t('about.features.community.title'),
      description: t('about.features.community.description'),
      color: 'primary'
    },
    {
      icon: Shield,
      title: t('about.features.security.title'),
      description: t('about.features.security.description'),
      color: 'success'
    },
    {
      icon: Clock,
      title: t('about.features.accessibility.title'),
      description: t('about.features.accessibility.description'),
      color: 'warning'
    },
    {
      icon: Heart,
      title: t('about.features.care.title'),
      description: t('about.features.care.description'),
      color: 'error'
    }
  ]

  const stats = [
    { number: '500+', label: t('about.stats.doctors') },
    { number: '50+', label: t('about.stats.specialties') },
    { number: '1000+', label: t('about.stats.patients') },
    { number: '24/7', label: t('about.stats.support') }
  ]

  const values = [
    t('about.values.accessibility'),
    t('about.values.security'),
    t('about.values.innovation'),
    t('about.values.community')
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-20 bg-primary-700">
        <div className="absolute inset-0 opacity-30 bg-gradient-radial from-primary-400 via-primary-600 to-primary-800" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-primary-100 font-bold mb-6">
              {t('about.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              {t('about.hero.subtitle')}
            </p>
            <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">
              {t('about.mission.title')}
            </h2>
            <p className="text-xl text-secondary-600 max-w-4xl mx-auto leading-relaxed">
              {t('about.mission.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-secondary-900 mb-6">
                {t('about.mission.subtitle')}
              </h3>
              <div className="space-y-4">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-success-600 mt-1 flex-shrink-0" />
                    <p className="text-secondary-700 text-lg">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-elevated border border-secondary-100">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 drop-shadow-glow">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-secondary-900 mb-4">
                  {t('about.mission.vision')}
                </h4>
                <p className="text-secondary-600">
                  {t('about.mission.visionText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              {t('about.features.title')}
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              {t('about.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center group">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-${feature.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-soft`}>
                    <Icon className={`w-8 h-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              {t('about.stats.title')}
            </h2>
            <p className="text-xl text-secondary-600">
              {t('about.stats.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
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

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-gradient-conic from-white via-primary-300 to-primary-700" />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('about.cta.title')}
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            {t('about.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="btn btn-lg bg-white text-primary-600 hover:bg-primary-50 shadow-elevated">
              {t('about.cta.join')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
