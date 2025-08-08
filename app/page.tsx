"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImageCarousel } from "@/components/ui/image-carousel"
import { Heart, Users, Calendar, Pill, Shield, Clock, Award, Phone, Globe, UserCheck, FileText, Truck, Headphones, MapPin, Mail, Facebook, Twitter, Instagram, Youtube, MessageCircle, Navigation, Zap } from 'lucide-react'

export default function LandingPage() {
  const [language, setLanguage] = useState('hindi')

  const content = {
    hindi: {
      hospitalName: "आरोग्य अस्पताल",
      nav: {
        home: "मुख्य पृष्ठ",
        about: "हमारे बारे में", 
        contact: "संपर्क करें",
        login: "लॉगिन"
      },
      hero: {
        badge: "50,000+ मरीज़ों द्वारा विश्वसनीय",
        title: "आपकी स्वास्थ्य",
        titleHighlight: "यात्रा",
        titleEnd: "हमारी प्राथमिकता",
        description: "आरोग्य अस्पताल में, हम आपकी स्वास्थ्य देखभाल को सरल, सुरक्षित और सुविधाजनक बनाते हैं। ऑनलाइन अपॉइंटमेंट से लेकर डिजिटल रिपोर्ट्स तक, आपका स्वास्थ्य अब आपकी मुट्ठी में।",
        getStarted: "अपॉइंटमेंट बुक करें",
        bookDemo: "हमसे मिलें",
        stats: {
          hospitals: "खुश मरीज़",
          patients: "सफल उपचार", 
          uptime: "संतुष्टि दर"
        }
      },
      features: {
        title: "आपकी स्वास्थ्य देखभाल के लिए आवश्यक सब कुछ",
        subtitle: "हमारी आधुनिक सुविधाएं आपको बेहतर स्वास्थ्य अनुभव प्रदान करती हैं",
        patientManagement: {
          title: "आसान अपॉइंटमेंट",
          description: "घर बैठे ऑनलाइन अपॉइंटमेंट बुक करें, अपना समय चुनें और लंबी कतारों से बचें"
        },
        doctorDashboard: {
          title: "डिजिटल रिपोर्ट्स",
          description: "अपनी सभी मेडिकल रिपोर्ट्स, टेस्ट रिजल्ट्स और प्रिस्क्रिप्शन ऑनलाइन देखें और डाउनलोड करें"
        },
        pharmacySystem: {
          title: "होम डिलीवरी",
          description: "दवाइयां घर पर मंगवाएं। हमारी फार्मेसी से सीधे आपके दरवाजे तक डिलीवरी"
        },
        appointmentBooking: {
          title: "24/7 सहायता",
          description: "किसी भी समय हमारी हेल्पलाइन पर कॉल करें या चैट करें। आपातकालीन सेवाएं हमेशा उपलब्ध"
        }
      },
      about: {
        title: "आरोग्य अस्पताल आपके लिए क्यों सबसे अच्छा है?",
        description: "हम समझते हैं कि हर मरीज़ अलग है। इसीलिए हमने आपकी सुविधा को ध्यान में रखते हुए अपनी सेवाएं डिज़ाइन की हैं। आपका स्वास्थ्य, आपकी सुविधा, हमारी जिम्मेदारी।",
        support247: {
          title: "तुरंत सेवा",
          description: "कोई लंबा इंतज़ार नहीं। अपॉइंटमेंट के समय पर मिलें डॉक्टर से और पाएं तुरंत इलाज"
        },
        compliance: {
          title: "सुरक्षित और निजी",
          description: "आपकी व्यक्तिगत जानकारी पूरी तरह सुरक्षित। भारतीय मेडिकल नियमों के अनुसार डेटा सुरक्षा"
        },
        awardWinning: {
          title: "विशेषज्ञ डॉक्टर्स",
          description: "अनुभवी और योग्य डॉक्टर्स जो आपकी हर स्वास्थ्य समस्या का बेहतरीन समाधान देते हैं"
        }
      },
      cta: {
        title: "आज ही शुरू करें अपनी बेहतर स्वास्थ्य की शुरुआत",
        subtitle: "50,000+ संतुष्ट मरीज़ों का भरोसा। आपकी स्वास्थ्य देखभाल अब और भी आसान।",
        startTrial: "तुरंत अपॉइंटमेंट बुक करें",
        scheduleDemo: "निःशुल्क सलाह लें"
      },
      contact: {
        title: "हमसे जुड़ें",
        subtitle: "कोई सवाल है? हम आपकी मदद के लिए हमेशा तैयार हैं",
        getInTouch: "संपर्क करें",
        visitUs: "हमसे मिलें",
        callUs: "कॉल करें",
        phone: "+91 98765 43210",
        email: "ईमेल करें",
        emailAddress: "care@arogyahospital.com",
        address: "पता",
        fullAddress: "123, स्वास्थ्य नगर, कनॉट प्लेस के पास, नई दिल्ली - 110001",
        supportHours: "सेवा समय",
        available: "24/7 उपलब्ध",
        emergency: "आपातकाल",
        emergencyPhone: "+91 98765 43211",
        directions: "दिशा निर्देश पाएं",
        bookAppointment: "अपॉइंटमेंट बुक करें",
        liveChat: "लाइव चैट",
        whatsapp: "व्हाट्सऐप पर संदेश"
      },
      footer: {
        hospitalName: "आरोग्य अस्पताल",
        tagline: "आपकी स्वास्थ्य देखभाल में आपका विश्वसनीय साथी",
        quickLinks: {
          title: "त्वरित लिंक",
          home: "मुख्य पृष्ठ",
          about: "हमारे बारे में",
          services: "सेवाएं",
          doctors: "डॉक्टर्स",
          contact: "संपर्क करें",
          emergency: "आपातकाल"
        },
        services: {
          title: "हमारी सेवाएं",
          generalMedicine: "सामान्य चिकित्सा",
          cardiology: "हृदय रोग",
          orthopedics: "हड्डी रोग",
          pediatrics: "बाल रोग",
          gynecology: "स्त्री रोग",
          pharmacy: "फार्मेसी"
        },
        contact: {
          title: "संपर्क जानकारी",
          address: "123, स्वास्थ्य नगर, नई दिल्ली - 110001",
          phone: "+91 98765 43210",
          email: "care@arogyahospital.com",
          emergency: "आपातकाल: +91 98765 43211"
        },
        hours: {
          title: "समय सारणी",
          opd: "OPD: सुबह 8:00 - शाम 8:00",
          emergency: "आपातकाल: 24/7 उपलब्ध",
          pharmacy: "फार्मेसी: सुबह 7:00 - रात 11:00"
        },
        social: {
          title: "हमसे जुड़ें",
          facebook: "Facebook",
          twitter: "Twitter",
          instagram: "Instagram",
          youtube: "YouTube"
        },
        copyright: "© 2024 आरोग्य अस्पताल। सभी अधिकार सुरक्षित।",
        privacy: "गोपनीयता नीति",
        terms: "नियम और शर्तें",
        disclaimer: "अस्वीकरण"
      }
    },
    english: {
      hospitalName: "Arogya Hospital",
      nav: {
        home: "Home",
        about: "About",
        contact: "Contact", 
        login: "Login"
      },
      hero: {
        badge: "Trusted by 50,000+ Patients",
        title: "Your Health",
        titleHighlight: "Journey",
        titleEnd: "Our Priority",
        description: "At Arogya Hospital, we make your healthcare simple, secure, and convenient. From online appointments to digital reports, your health is now at your fingertips.",
        getStarted: "Book Appointment",
        bookDemo: "Meet Our Team",
        stats: {
          hospitals: "Happy Patients",
          patients: "Successful Treatments", 
          uptime: "Satisfaction Rate"
        }
      },
      features: {
        title: "Everything You Need for Your Healthcare",
        subtitle: "Our modern facilities provide you with an exceptional healthcare experience",
        patientManagement: {
          title: "Easy Appointments",
          description: "Book appointments online from home, choose your preferred time, and avoid long queues"
        },
        doctorDashboard: {
          title: "Digital Reports",
          description: "View and download all your medical reports, test results, and prescriptions online anytime"
        },
        pharmacySystem: {
          title: "Home Delivery",
          description: "Get medicines delivered to your doorstep. Direct delivery from our pharmacy to your home"
        },
        appointmentBooking: {
          title: "24/7 Support",
          description: "Call or chat with our helpline anytime. Emergency services are always available for you"
        }
      },
      about: {
        title: "Why Arogya Hospital is Best for You?",
        description: "We understand that every patient is unique. That's why we've designed our services keeping your convenience in mind. Your health, your comfort, our responsibility.",
        support247: {
          title: "Instant Service",
          description: "No long waits. Meet doctors on time for your appointment and get immediate treatment"
        },
        compliance: {
          title: "Safe & Private",
          description: "Your personal information is completely secure. Data protection as per Indian medical regulations"
        },
        awardWinning: {
          title: "Expert Doctors",
          description: "Experienced and qualified doctors who provide the best solutions for all your health problems"
        }
      },
      cta: {
        title: "Start Your Better Health Journey Today",
        subtitle: "Trusted by 50,000+ satisfied patients. Your healthcare is now easier than ever.",
        startTrial: "Book Appointment Now",
        scheduleDemo: "Get Free Consultation"
      },
      contact: {
        title: "Connect with Us",
        subtitle: "Have questions? We're always ready to help you",
        getInTouch: "Get in Touch",
        visitUs: "Visit Us",
        callUs: "Call Us",
        phone: "+91 98765 43210",
        email: "Email Us",
        emailAddress: "care@arogyahospital.com",
        address: "Address",
        fullAddress: "123, Health Nagar, Near Connaught Place, New Delhi - 110001",
        supportHours: "Service Hours",
        available: "24/7 Available",
        emergency: "Emergency",
        emergencyPhone: "+91 98765 43211",
        directions: "Get Directions",
        bookAppointment: "Book Appointment",
        liveChat: "Live Chat",
        whatsapp: "WhatsApp Message"
      },
      footer: {
        hospitalName: "Arogya Hospital",
        tagline: "Your trusted partner in healthcare",
        quickLinks: {
          title: "Quick Links",
          home: "Home",
          about: "About Us",
          services: "Services",
          doctors: "Doctors",
          contact: "Contact",
          emergency: "Emergency"
        },
        services: {
          title: "Our Services",
          generalMedicine: "General Medicine",
          cardiology: "Cardiology",
          orthopedics: "Orthopedics",
          pediatrics: "Pediatrics",
          gynecology: "Gynecology",
          pharmacy: "Pharmacy"
        },
        contact: {
          title: "Contact Info",
          address: "123, Health Nagar, New Delhi - 110001",
          phone: "+91 98765 43210",
          email: "care@arogyahospital.com",
          emergency: "Emergency: +91 98765 43211"
        },
        hours: {
          title: "Working Hours",
          opd: "OPD: 8:00 AM - 8:00 PM",
          emergency: "Emergency: 24/7 Available",
          pharmacy: "Pharmacy: 7:00 AM - 11:00 PM"
        },
        social: {
          title: "Follow Us",
          facebook: "Facebook",
          twitter: "Twitter",
          instagram: "Instagram",
          youtube: "YouTube"
        },
        copyright: "© 2024 Arogya Hospital. All rights reserved.",
        privacy: "Privacy Policy",
        terms: "Terms & Conditions",
        disclaimer: "Disclaimer"
      }
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'hindi' ? 'english' : 'hindi')
  }

  const t = content[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">{t.hospitalName}</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-gray-700 hover:text-pink-500 transition-colors font-medium">
                {t.nav.home}
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-pink-500 transition-colors font-medium">
                {t.nav.about}
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-pink-500 transition-colors font-medium">
                {t.nav.contact}
              </Link>
              <Button 
                onClick={toggleLanguage}
                variant="outline" 
                size="sm"
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <Globe className="h-4 w-4 mr-2" />
                {language === 'hindi' ? 'English' : 'हिंदी'}
              </Button>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  {t.nav.login}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
                <Heart className="h-4 w-4 mr-2" />
                {t.hero.badge}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                {t.hero.title}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600"> {t.hero.titleHighlight}</span>
                <br />{t.hero.titleEnd}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {t.hero.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-full px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    {t.hero.getStarted}
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full px-8 py-4 text-lg">
                  {t.hero.bookDemo}
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-gray-600">{t.hero.stats.hospitals}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">1L+</div>
                  <div className="text-gray-600">{t.hero.stats.patients}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-gray-600">{t.hero.stats.uptime}</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl p-8 shadow-2xl">
                <ImageCarousel
                  images={[
                    "/landingpage/pic1.jpeg",
                    "/landingpage/pic2.jpeg"
                  ]}
                  autoRotate={true}
                  rotationInterval={5000}
                  showControls={true}
                  showIndicators={true}
                  className="w-full h-[500px] rounded-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">System Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-pink-100 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t.features.patientManagement.title}</h3>
                <p className="text-gray-600">
                  {t.features.patientManagement.description}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-pink-100 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t.features.doctorDashboard.title}</h3>
                <p className="text-gray-600">
                  {t.features.doctorDashboard.description}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-pink-100 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t.features.pharmacySystem.title}</h3>
                <p className="text-gray-600">
                  {t.features.pharmacySystem.description}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-pink-100 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t.features.appointmentBooking.title}</h3>
                <p className="text-gray-600">
                  {t.features.appointmentBooking.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.about.title}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t.about.description}
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{t.about.support247.title}</h3>
                    <p className="text-gray-600">{t.about.support247.description}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{t.about.compliance.title}</h3>
                    <p className="text-gray-600">{t.about.compliance.description}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Award className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{t.about.awardWinning.title}</h3>
                    <p className="text-gray-600">{t.about.awardWinning.description}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl p-6 shadow-2xl">
                <Image
                  src="/pic3.jpeg"
                  alt="Healthcare Team - Arogya Hospital"
                  width={500}
                  height={400}
                  className="rounded-2xl shadow-lg object-cover w-full h-[400px]"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-lg border border-pink-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Trusted Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-400 to-pink-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            {t.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-pink-500 hover:bg-gray-50 rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                {t.cta.startTrial}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-white text-pink-500 hover:bg-gray-50 rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              {t.cta.scheduleDemo}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.contact.title}
            </h2>
            <p className="text-xl text-gray-600">
              {t.contact.subtitle}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-pink-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl mr-3">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  {t.contact.getInTouch}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <Phone className="h-5 w-5 text-pink-500 mr-2" />
                      <span className="font-semibold text-gray-900">{t.contact.callUs}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{t.contact.phone}</p>
                    <Button className="mt-3 bg-pink-500 hover:bg-pink-600 text-white text-sm px-4 py-2 rounded-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  </div>

                  {/* Email */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <Mail className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-semibold text-gray-900">{t.contact.email}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{t.contact.emailAddress}</p>
                    <Button className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>

                  {/* Emergency */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <Zap className="h-5 w-5 text-red-500 mr-2" />
                      <span className="font-semibold text-gray-900">{t.contact.emergency}</span>
                    </div>
                    <p className="text-red-700 font-bold">{t.contact.emergencyPhone}</p>
                    <Button className="mt-3 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Emergency Call
                    </Button>
                  </div>

                  {/* WhatsApp */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <MessageCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-semibold text-gray-900">{t.contact.whatsapp}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{t.contact.phone}</p>
                    <Button className="mt-3 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-8 bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="font-semibold text-gray-900">{t.contact.address}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{t.contact.fullAddress}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white text-sm px-4 py-2 rounded-full">
                      <Navigation className="h-4 w-4 mr-2" />
                      {t.contact.directions}
                    </Button>
                    <Button className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-4 py-2 rounded-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      {t.contact.bookAppointment}
                    </Button>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-2xl">
                  <div className="flex items-center mb-3">
                    <Clock className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="font-semibold text-gray-900">{t.contact.supportHours}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700"><span className="font-medium">OPD:</span> 8:00 AM - 8:00 PM</p>
                    <p className="text-gray-700"><span className="font-medium">Pharmacy:</span> 7:00 AM - 11:00 PM</p>
                    <p className="text-red-600 font-bold"><span className="font-medium">Emergency:</span> {t.contact.available}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-pink-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl mr-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  {t.contact.visitUs}
                </h3>
                
                {/* Google Maps Embed */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.2396328147944!2d77.21975931508236!3d28.63576098240235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd0683d1e6c3%3A0x8b5b2b1b1b1b1b1b!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1642678901234!5m2!1sen!2sin"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-2xl"
                  ></iframe>
                  
                  {/* Map Overlay */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">आरोग्य अस्पताल</span>
                    </div>
                  </div>
                </div>

                {/* Location Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                    <div className="bg-green-500 p-2 rounded-lg w-10 h-10 mx-auto mb-2">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Easy Parking</p>
                    <p className="text-xs text-gray-600">200+ Slots</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                    <div className="bg-blue-500 p-2 rounded-lg w-10 h-10 mx-auto mb-2">
                      <Navigation className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Metro Access</p>
                    <p className="text-xs text-gray-600">2 Min Walk</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                    <div className="bg-purple-500 p-2 rounded-lg w-10 h-10 mx-auto mb-2">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Ambulance</p>
                    <p className="text-xs text-gray-600">24/7 Ready</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl text-center">
                    <div className="bg-orange-500 p-2 rounded-lg w-10 h-10 mx-auto mb-2">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Safe Zone</p>
                    <p className="text-xs text-gray-600">CCTV Secured</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-full py-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Visit
                  </Button>
                  <Button variant="outline" className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full py-3">
                    <Phone className="h-4 w-4 mr-2" />
                    Call First
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Hospital Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">{t.footer.hospitalName}</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {t.footer.tagline}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-pink-400" />
                  <span className="text-gray-300">{t.footer.contact.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-pink-400" />
                  <span className="text-gray-300">{t.footer.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-pink-400" />
                  <span className="text-gray-300">{t.footer.contact.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-red-400" />
                  <span className="text-red-300 font-medium">{t.footer.contact.emergency}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-pink-400">{t.footer.quickLinks.title}</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.quickLinks.home}</Link></li>
                <li><Link href="#about" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.quickLinks.about}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.quickLinks.services}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.quickLinks.doctors}</Link></li>
                <li><Link href="#contact" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.quickLinks.contact}</Link></li>
                <li><Link href="#" className="text-red-300 hover:text-red-400 transition-colors font-medium">{t.footer.quickLinks.emergency}</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-pink-400">{t.footer.services.title}</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.services.generalMedicine}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.services.cardiology}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.services.orthopedics}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.services.pediatrics}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.services.gynecology}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-pink-400 transition-colors">{t.footer.services.pharmacy}</Link></li>
              </ul>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-pink-400">{t.footer.hours.title}</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">{t.footer.hours.opd}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-red-300 text-sm font-medium">{t.footer.hours.emergency}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Pill className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">{t.footer.hours.pharmacy}</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-3 text-pink-400">{t.footer.social.title}</h4>
                <div className="flex space-x-3">
                  <Link href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-pink-500 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </Link>
                  <Link href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-pink-500 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </Link>
                  <Link href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-pink-500 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </Link>
                  <Link href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-pink-500 transition-colors">
                    <Youtube className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                {t.footer.copyright}
              </p>
              <div className="flex space-x-6 text-sm">
                <Link href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                  {t.footer.privacy}
                </Link>
                <Link href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                  {t.footer.terms}
                </Link>
                <Link href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                  {t.footer.disclaimer}
                </Link>
              </div>
            </div>
            
            {/* Trust Badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center bg-gray-800 px-4 py-2 rounded-full">
                <Shield className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-sm text-gray-300">ISO 9001:2015 Certified | NABH Accredited</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
