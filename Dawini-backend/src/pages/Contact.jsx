import { useTranslation } from 'react-i18next'
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
// Leaflet will be loaded dynamically
let L = null;
import { useEffect } from 'react'

export default function Contact() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', null

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const leafletModule = await import('leaflet');
        L = leafletModule.default;
        await import('leaflet/dist/leaflet.css');
      } catch (error) {
        console.warn('Leaflet not available:', error);
      }
    };
    loadLeaflet();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Initialize map
  useEffect(() => {
    const mapContainer = document.getElementById('contact-map')
    if (mapContainer && !mapContainer._leaflet_id && L) {
      const map = L.map('contact-map').setView([36.7538, 3.0588], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map)
      
      L.marker([36.7538, 3.0588])
        .addTo(map)
        .bindPopup('Dawini - Centre Médical<br/>Alger, Algérie')
        .openPopup()
    }
  }, [])

  const contactInfo = [
    {
      icon: Mail,
      title: t('contact.info.email.title'),
      value: 'dawini_contact@gmail.com',
      link: 'mailto:dawini_contact@gmail.com',
      color: 'primary'
    },
    {
      icon: Phone,
      title: t('contact.info.phone.title'),
      value: '+213 XXX XXX XXX',
      link: 'tel:+213XXXXXXXXX',
      color: 'success'
    },
    {
      icon: MapPin,
      title: t('contact.info.address.title'),
      value: t('contact.info.address.value'),
      link: '#',
      color: 'warning'
    },
    {
      icon: Clock,
      title: t('contact.info.hours.title'),
      value: t('contact.info.hours.value'),
      link: '#',
      color: 'error'
    }
  ]

  const socialLinks = [
    {
      icon: Instagram,
      name: 'Instagram',
      url: 'https://instagram.com/dawinidz',
      color: 'bg-gradient-to-r from-pink-500 to-purple-600'
    },
    {
      icon: Facebook,
      name: 'Facebook',
      url: 'https://facebook.com/dawinidz',
      color: 'bg-blue-600'
    },
    {
      icon: MessageCircle,
      name: 'WhatsApp',
      url: 'https://wa.me/213XXXXXXXXX',
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-800/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('contact.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              {t('contact.hero.subtitle')}
            </p>
            <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                {t('contact.info.title')}
              </h2>
              <p className="text-lg text-secondary-600 mb-8">
                {t('contact.info.subtitle')}
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-${info.color}-100 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${info.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                        {info.title}
                      </h3>
                      <a
                        href={info.link}
                        className="text-secondary-600 hover:text-primary-600 transition-colors duration-200"
                      >
                        {info.value}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Social Links */}
            <div className="pt-8 border-t border-secondary-200">
              <h3 className="text-xl font-semibold text-secondary-900 mb-6">
                {t('contact.social.title')}
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 ${social.color} rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200`}
                      title={social.name}
                    >
                      <Icon className="w-6 h-6" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
              {t('contact.form.title')}
            </h2>
            <p className="text-secondary-600 mb-8">
              {t('contact.form.subtitle')}
            </p>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
                <p className="text-success-700 font-medium">Message envoyé avec succès !</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-error-600 mr-3" />
                <p className="text-error-700 font-medium">Erreur lors de l'envoi. Veuillez réessayer.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    {t('contact.form.name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="label">
                    {t('contact.form.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  {t('contact.form.subject')} *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="label">
                  {t('contact.form.message')} *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="input resize-none"
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {t('contact.form.submit')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Notre Localisation
            </h2>
            <p className="text-lg text-secondary-600">
              Trouvez-nous facilement à Alger
            </p>
          </div>
          <div className="card p-0 overflow-hidden">
            <div id="contact-map" className="w-full h-96 rounded-2xl"></div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              {t('contact.faq.title')}
            </h2>
            <p className="text-lg text-secondary-600">
              {t('contact.faq.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                {t('contact.faq.question1')}
              </h3>
              <p className="text-secondary-600">
                {t('contact.faq.answer1')}
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                {t('contact.faq.question2')}
              </h3>
              <p className="text-secondary-600">
                {t('contact.faq.answer2')}
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                {t('contact.faq.question3')}
              </h3>
              <p className="text-secondary-600">
                {t('contact.faq.answer3')}
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                {t('contact.faq.question4')}
              </h3>
              <p className="text-secondary-600">
                {t('contact.faq.answer4')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
