"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { Navbar } from '@/components/landing/Navbar';
import { Heart, Users, Calendar, Pill, Shield, Clock, Award, Phone, Globe, UserCheck, FileText, Truck, Headphones, MapPin, Mail, Facebook, Twitter, Instagram, Youtube, MessageCircle, Navigation, Zap, Star, GraduationCap, Stethoscope, User, CalendarDays, Send, CheckCircle, Bell, RefreshCw, MenuIcon } from 'lucide-react';

const content = {
  hindi: {
    hospitalName: "आरोग्य अस्पताल",
    nav: {
      home: "मुख्य पृष्ठ",
      about: "हमारे बारे में",
      doctors: "हमारे डॉक्टर",
      appointment: "अपॉइंटमेंट बुक करें",
      contact: "संपर्क करें",
      login: "लॉगिन"
    },
    hero: {
      badge: "1M+ मरीज़ों का भरोसा • 5K+ बच्चों का सुरक्षित प्रसव",
      title: "आपकी स्वास्थ्य",
      titleHighlight: "यात्रा",
      titleEnd: "हमारी प्राथमिकता",
      description: "आरोग्य अस्पताल में, हम आपकी स्वास्थ्य देखभाल को सरल, सुरक्षित और सुविधाजनक बनाते हैं। ऑनलाइन अपॉइंटमेंट से लेकर डिजिटल रिपोर्ट तक, आपका स्वास्थ्य अब आपके हाथों में है।",
      getStarted: "अपॉइंटमेंट बुक करें",
      bookDemo: "हमसे मिलें",
      stats: {
        hospitals: "खुश मरीज़",
        babies: "बच्चों का प्रसव",
        uptime: "संतुष्टि दर"
      }
    },
    doctors: {
      title: "हमारे विशेषज्ञ डॉक्टरों से मिलें",
      subtitle: "हमारी अनुभवी और योग्य डॉक्टरों की टीम आपको सर्वोत्तम स्वास्थ्य सेवा प्रदान करने के लिए यहाँ है",
      viewProfile: "प्रोफाइल देखें",
      bookAppointment: "अपॉइंटमेंट बुक करें",
      experience: "अनुभव",
      patients: "मरीज़ों का इलाज",
      rating: "रेटिंग",
      languages: "भाषाएं",
      availability: "उपलब्ध"
    },
    appointment: {
      title: "सर्जरी के लिए ऑनलाइन अपॉइंटमेंट बुक करें",
      subtitle: "हमारे विशेषज्ञ सर्जनों के साथ सर्जिकल प्रक्रियाओं के लिए अपनी मुलाकात का समय तय करें। सर्जरी की योजना बनाएं और पूर्व-परामर्श लें।",
      form: {
        name: "पूरा नाम",
        phone: "फोन नंबर",
        email: "ईमेल पता",
        department: "विभाग चुनें",
        doctor: "डॉक्टर चुनें",
        date: "पसंदीदा तारीख",
        time: "पसंदीदा समय",
        reason: "सर्जरी का प्रकार और विवरण",
        submit: "सर्जरी अपॉइंटमेंट बुक करें",
        submitting: "बुक हो रहा है...",
        success: "सर्जरी अपॉइंटमेंट सफलतापूर्वक बुक हो गया!",
        error: "सर्जरी अपॉइंटमेंट बुक करने में असफल। कृपया पुनः प्रयास करें।"
      },
      benefits: {
        title: "सर्जरी के लिए ऑनलाइन बुकिंग क्यों करें?",
        noWaiting: {
          title: "पूर्व-नियोजित सर्जरी",
          description: "सर्जरी की तारीख पहले से तय करें और अस्पताल में व्यर्थ प्रतीक्षा से बचें"
        },
        confirmation: {
          title: "सर्जरी की पुष्टि",
          description: "SMS और ईमेल के माध्यम से सर्जरी की तारीख और समय की पुष्टि प्राप्त करें"
        },
        reminder: {
          title: "सर्जरी रिमाइंडर",
          description: "सर्जरी से पहले तैयारी के निर्देश और समय पर रिमाइंडर प्राप्त करें"
        },
        reschedule: {
          title: "आसान रीशेड्यूलिंग",
          description: "आपातकाल की स्थिति में सर्जरी की तारीख आसानी से बदलें"
        }
      }
    },
    features: {
      title: "Everything You Need for Your Healthcare",
      subtitle: "Our modern facilities provide you with a better healthcare experience",
      patientManagement: {
        title: "Easy Appointments",
        description: "Book online appointments from home, choose your time and avoid long queues"
      },
      doctorDashboard: {
        title: "Digital Reports",
        description: "View and download all your medical reports, test results and prescriptions online"
      },
      pharmacySystem: {
        title: "Home Delivery",
        description: "Get medicines delivered to your home. Direct delivery from our pharmacy to your doorstep"
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
    gynecology: {
      badge: "मातृत्व और महिला स्वास्थ्य विशेषज्ञ",
      title: "नए जीवन का स्वागत",
      titleHighlight: "विशेषज्ञ देखभाल",
      titleEnd: "के साथ",
      description: "डॉ. निहारिका नायक ने 10+ वर्षों की स्त्री रोग और प्रसूति विज्ञान में अपनी विशेषज्ञता के साथ 5,000 से अधिक बच्चों का सफल प्रसव कराया है। वह सुरक्षित प्रसव और मातृ कल्याण पर ध्यान देने के साथ व्यापक महिला स्वास्थ्य सेवा प्रदान करती हैं, जिससे हजारों खुश माता-पिता को खुशी मिली है।",
      stats: {
        deliveries: "सुरक्षित प्रसव",
        experience: "वर्षों का अनुभव",
        mothers: "खुश माता-पिता",
        rating: "मरीज़ रेटिंग"
      },
      bookConsultation: "परामर्श बुक करें",
      emergencyMaternity: "आपातकालीन मातृत्व",
      achievementBadge: "5000+ सुरक्षित प्रसव"
    },
    founder: {
      badge: "अस्पताल संस्थापक और मुख्य आर्थोपेडिक सर्जन",
      title: "हमारे",
      titleHighlight: "संस्थापक",
      titleEnd: "से मिलें",
      description: "डॉ. जी के नायक, आरोग्य अस्पताल के दूरदर्शी संस्थापक, ने 40 से अधिक वर्षों तक असाधारण आर्थोपेडिक देखभाल प्रदान करने के लिए समर्पित किया है। रोगी कल्याण और चिकित्सा उत्कृष्टता के प्रति उनकी प्रतिबद्धता ने आरोग्य अस्पताल को स्वास्थ्य सेवा में एक विश्वसनीय नाम बनाया है।",
      qualifications: {
        title: "विशेषज्ञ योग्यताएं",
        description: "जोड़ों के प्रतिस्थापन और आघात सर्जरी में 40+ वर्षों के विशेष अनुभव के साथ एमएस (आर्थोपेडिक्स)"
      },
      vision: {
        title: "रोगी-केंद्रित दृष्टि",
        description: "सभी को सुलभ, गुणवत्तापूर्ण स्वास्थ्य सेवा प्रदान करने के मिशन के साथ आरोग्य अस्पताल की स्थापना की"
      },
      excellence: {
        title: "चिकित्सा उत्कृष्टता",
        description: "सफल आर्थोपेडिक प्रक्रियाओं और उपचारों के साथ 7,00,000+ से अधिक रोगियों का इलाज किया"
      },
      meetFounder: "संस्थापक से मिलें",
      orthopedicConsultation: "आर्थोपेडिक परामर्श",
      founderBadge: "अस्पताल संस्थापक"
    },
    cta: {
      title: "आज ही शुरू करें अपनी बेहतर स्वास्थ्य की शुरुआत",
      subtitle: "1M+ संतुष्ट मरीज़ों का भरोसा। 5K+ बच्चों का सुरक्षित प्रसव। आपकी स्वास्थ्य देखभाल अब और भी आसान।",
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
      doctors: "Our Doctors",
      appointment: "Book Appointment",
      contact: "Contact",
      login: "Login"
    },
    hero: {
      badge: "Trusted by 1M+ Patients • 5K+ Babies Delivered Safely",
      title: "Your Health",
      titleHighlight: "Journey",
      titleEnd: "Our Priority",
      description: "At Arogya Hospital, we make your healthcare simple, secure, and convenient. From online appointments to digital reports, your health is now at your fingertips.",
      getStarted: "Book Appointment",
      bookDemo: "Meet Our Team",
      stats: {
        hospitals: "Happy Patients",
        babies: "Babies Delivered",
        uptime: "Satisfaction Rate"
      }
    },
    doctors: {
      title: "Meet Our Expert Doctors",
      subtitle: "Our team of experienced and qualified doctors are here to provide you with the best healthcare",
      viewProfile: "View Profile",
      bookAppointment: "Book Appointment",
      experience: "Experience",
      patients: "Patients Treated",
      rating: "Rating",
      languages: "Languages",
      availability: "Available"
    },
    appointment: {
      title: "Book Your Surgery Appointment Online",
      subtitle: "Schedule your surgical procedures with our expert surgeons. Plan your surgery and get pre-consultation.",
      form: {
        name: "Full Name",
        phone: "Phone Number",
        email: "Email Address",
        department: "Select Department",
        doctor: "Select Doctor",
        date: "Preferred Date",
        time: "Preferred Time",
        reason: "Surgery Type and Details",
        submit: "Book Surgery Appointment",
        submitting: "Booking...",
        success: "Surgery appointment booked successfully!",
        error: "Failed to book surgery appointment. Please try again."
      },
      benefits: {
        title: "Why Book Surgery Online?",
        noWaiting: {
          title: "Pre-Planned Surgery",
          description: "Schedule your surgery date in advance and avoid unnecessary waiting at the hospital"
        },
        confirmation: {
          title: "Surgery Confirmation",
          description: "Get immediate confirmation of surgery date and time via SMS and email"
        },
        reminder: {
          title: "Surgery Reminders",
          description: "Receive pre-surgery preparation instructions and timely reminders"
        },
        reschedule: {
          title: "Easy Rescheduling",
          description: "Easily reschedule your surgery date in case of emergencies"
        }
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
    gynecology: {
      badge: "Maternity & Women's Health Expert",
      title: "Bringing New Life with",
      titleHighlight: "Expert Care",
      titleEnd: "",
      description: "Dr. Niharika Nayak has successfully delivered over 5,000 babies with her 10+ years of expertise in gynecology and obstetrics. She provides comprehensive women's healthcare with a focus on safe deliveries and maternal wellness, bringing joy to thousands of happy parents.",
      stats: {
        deliveries: "Safe Deliveries",
        experience: "Years Experience",
        mothers: "Happy Parents",
        rating: "Patient Rating"
      },
      bookConsultation: "Book Consultation",
      emergencyMaternity: "Emergency Maternity",
      achievementBadge: "5000+ Safe Deliveries"
    },
    founder: {
      badge: "Hospital Founder & Chief Orthopedic Surgeon",
      title: "Meet Our",
      titleHighlight: "Founder",
      titleEnd: "",
      description: "Dr. G K Nayak, the visionary founder of Arogya Hospital, has dedicated over 40 years to providing exceptional orthopedic care. His commitment to patient welfare and medical excellence has made Arogya Hospital a trusted name in healthcare.",
      qualifications: {
        title: "Expert Qualifications",
        description: "MS (Orthopedics) with 40+ years of specialized experience in joint replacement and trauma surgery"
      },
      vision: {
        title: "Patient-Centric Vision",
        description: "Founded Arogya Hospital with the mission to provide accessible, quality healthcare to all"
      },
      excellence: {
        title: "Medical Excellence",
        description: "Treated over 700,000+ patients with successful orthopedic procedures and treatments"
      },
      meetFounder: "Meet the Founder",
      orthopedicConsultation: "Orthopedic Consultation",
      founderBadge: "Hospital Founder"
    },
    cta: {
      title: "Start Your Better Health Journey Today",
      subtitle: "Trusted by 1M+ satisfied patients. 5K+ babies delivered safely. Your healthcare is now easier than ever.",
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
      copyright: " 2024 Arogya Hospital. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      disclaimer: "Disclaimer"
    }
  }
} as const;

type ContentType = typeof content;
type Language = keyof ContentType;

export default function LandingPage() {
  const { authState, logout } = useAuth();
  const [language, setLanguage] = useState<Language>('english');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [appointmentForm, setAppointmentForm] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const t = content[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'english' ? 'hindi' : 'english');
  };

  const handleAppointmentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentForm),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitMessage(' ' + result.message);
        setAppointmentForm({
          name: '',
          phone: '',
          email: '',
          department: '',
          doctor: '',
          date: '',
          time: '',
          reason: '',
        });
      } else {
        setSubmitMessage(` ${result.message || 'An unexpected error occurred.'}`);
      }
    } catch (error) {
      setSubmitMessage(' Failed to book appointment. Please try again.')
      console.error('Appointment booking error:', error)
    } finally {
      setIsSubmitting(false)
    }
  };

  const doctors = [
    {
      id: 1,
      name: 'Dr G K Nayak',
      specialization: 'Orthopedics (Founder)',
      qualification: 'MS (Ortho), Founder',
      experience: '40+ Years',
      patients: '700K+',
      rating: 4.9,
      availability: 'Mon-Sat, 9am-1pm',
      languages: ['Hindi', 'English'],
      about: 'Dr. G K Nayak is the founder of Arogya Hospital and a renowned orthopedic surgeon with over 40 years of experience in joint replacement and trauma surgery. He has successfully treated over 700,000 patients.',
      isFounder: true
    },
    {
      id: 2,
      name: 'Dr Niharika Nayak',
      specialization: 'Gynecology',
      qualification: 'MD, DGO',
      experience: '10+ Years',
      patients: '15K+',
      rating: 4.9,
      availability: 'Tue-Sat, 2pm-5pm',
      languages: ['Hindi', 'English'],
      about: 'Dr. Niharika Nayak is a leading gynecologist with 10+ years of experience in gynecology and obstetrics. She has successfully delivered over 5000 babies, bringing joy to thousands of happy parents.',
      isGynecologist: true
    },
    {
      id: 3,
      name: 'Dr Vinod Paliwal',
      specialization: 'Orthopedics',
      qualification: 'MS (Ortho)',
      experience: '15+ Years',
      patients: '5k+',
      rating: 4.8,
      availability: 'Mon-Fri, 10am-1pm',
      languages: ['Hindi', 'English'],
      about: 'Dr. Vinod Paliwal specializes in orthopedic surgery with expertise in joint replacement and sports injury treatment.'
    },
    {
      id: 4,
      name: 'Dr K D Singh',
      specialization: 'Anesthetics',
      qualification: 'MD (Anesthesia)',
      experience: '12+ Years',
      patients: '8k+',
      rating: 4.8,
      availability: 'Mon-Sat, 8am-6pm',
      languages: ['Hindi', 'English'],
      about: 'Dr. K D Singh is an experienced anesthetist ensuring safe and comfortable surgical procedures for all patients.'
    },
    {
      id: 5,
      name: 'Dr Ramakant Dewangan',
      specialization: 'Orthopedics',
      qualification: 'MS (Ortho)',
      experience: '10+ Years',
      patients: '4k+',
      rating: 4.7,
      availability: 'Tue-Sat, 9am-12pm',
      languages: ['Hindi', 'English'],
      about: 'Dr. Ramakant Dewangan specializes in orthopedic treatments with focus on bone and joint disorders.'
    },
    {
      id: 6,
      name: 'Dr Shreyansh Shukla',
      specialization: 'Orthopedics',
      qualification: 'MS (Ortho)',
      experience: '8+ Years',
      patients: '3k+',
      rating: 4.7,
      availability: 'Mon-Fri, 2pm-5pm',
      languages: ['Hindi', 'English'],
      about: 'Dr. Shreyansh Shukla is a skilled orthopedic surgeon with expertise in minimally invasive procedures.'
    },
    {
      id: 7,
      name: 'Dr Punit Mohanty',
      specialization: 'Orthopedics',
      qualification: 'MS (Ortho)',
      experience: '12+ Years',
      patients: '4.5k+',
      rating: 4.8,
      availability: 'Mon-Sat, 10am-1pm',
      languages: ['Hindi', 'English', 'Odia'],
      about: 'Dr. Punit Mohanty specializes in orthopedic surgery with particular expertise in spine and joint treatments.'
    },
    {
      id: 8,
      name: 'Dr Ajay Rathore',
      specialization: 'BAMS (Ayurveda)',
      qualification: 'BAMS',
      experience: '15+ Years',
      patients: '6k+',
      rating: 4.8,
      availability: 'Mon-Sat, 9am-2pm',
      languages: ['Hindi', 'English'],
      about: 'Dr. Ajay Rathore is an experienced Ayurvedic physician providing holistic treatment approaches for various health conditions.'
    },
    {
      id: 9,
      name: 'Dr Payal Rathore',
      specialization: 'Visiting Anesthetist',
      qualification: 'MD (Anesthesia)',
      experience: '10+ Years',
      patients: '3k+',
      rating: 4.7,
      availability: 'On Call',
      languages: ['Hindi', 'English'],
      about: 'Dr. Payal Rathore is a visiting anesthetist providing specialized anesthesia services for complex procedures.'
    },
    {
      id: 10,
      name: 'Dr Shubham Gupta',
      specialization: 'Visiting Surgeon',
      qualification: 'MS (Surgery)',
      experience: '12+ Years',
      patients: '4k+',
      rating: 4.8,
      availability: 'On Call',
      languages: ['Hindi', 'English'],
      about: 'Dr. Shubham Gupta is a visiting surgeon with expertise in general and laparoscopic surgical procedures.'
    },
    {
      id: 11,
      name: 'Dr R K Chandra',
      specialization: 'Visiting Surgeon',
      qualification: 'MS (Surgery)',
      experience: '20+ Years',
      patients: '7k+',
      rating: 4.9,
      availability: 'On Call',
      languages: ['Hindi', 'English'],
      about: 'Dr. R K Chandra is a senior visiting surgeon with extensive experience in complex surgical procedures and patient care.'
    }
  ];

  const departments = [
    "Orthopedic Surgery",
    "General Surgery", 
    "Gynecological Surgery",
    "Laparoscopic Surgery",
    "Joint Replacement Surgery",
    "Trauma Surgery",
    "Minimally Invasive Surgery",
    "Arthroscopic Surgery",
    "Spine Surgery",
    "Fracture Surgery",
    "Emergency Surgery"
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
    "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <Navbar 
        t={t}
        language={language}
        toggleLanguage={toggleLanguage}
        authState={authState}
        logout={logout}
      />

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
                  <div className="text-3xl font-bold text-gray-900">1M+</div>
                  <div className="text-gray-600">{t.hero.stats.hospitals}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">5K+</div>
                  <div className="text-gray-600">{t.hero.stats.babies}</div>
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
                    "/landingpage/pic2.jpeg",
                    "/landingpage/founder.jpeg"
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

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.doctors.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.doctors.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.slice(0, 6).map((doctor) => (
              <Card key={doctor.id} className="border-pink-100 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardContent className="p-0">
                  {/* Doctor Image */}
                  <div className={`relative h-64 ${doctor.isFounder ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' : doctor.isGynecologist ? 'bg-gradient-to-br from-purple-100 to-purple-200' : 'bg-gradient-to-br from-pink-100 to-pink-200'}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {doctor.isGynecologist ? (
                        <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-8 rounded-full relative">
                          <User className="h-16 w-16 text-white" />
                          {/* Baby icon overlay for gynecologist */}
                          <div className="absolute -bottom-2 -right-2 bg-pink-400 p-2 rounded-full">
                            <Heart className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className={`${doctor.isFounder ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-pink-400 to-pink-500'} p-8 rounded-full`}>
                          <User className="h-16 w-16 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Special Badges */}
                    {doctor.isFounder && (
                      <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        FOUNDER
                      </div>
                    )}
                    {doctor.isGynecologist && (
                      <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        5000+ BABIES
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{doctor.rating}</span>
                    </div>
                  </div>
                  
                  {/* Doctor Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                      <p className={`${doctor.isFounder ? 'text-yellow-600' : doctor.isGynecologist ? 'text-purple-600' : 'text-pink-600'} font-medium mb-2`}>{doctor.specialization}</p>
                      <p className="text-gray-600 text-sm">{doctor.qualification}</p>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className={`text-center ${doctor.isFounder ? 'bg-yellow-50' : doctor.isGynecologist ? 'bg-purple-50' : 'bg-pink-50'} p-3 rounded-lg`}>
                        <div className="text-lg font-bold text-gray-900">{doctor.experience}</div>
                        <div className="text-xs text-gray-600">{t.doctors.experience}</div>
                      </div>
                      <div className="text-center bg-blue-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{doctor.patients}</div>
                        <div className="text-xs text-gray-600">{t.doctors.patients}</div>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        <span>{t.doctors.availability}: {doctor.availability}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{t.doctors.languages}: {doctor.languages.join(', ')}</span>
                      </div>
                    </div>
                    
                    {/* About */}
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">{doctor.about}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button 
                        className={`flex-1 ${doctor.isFounder ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600' : doctor.isGynecologist ? 'bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600' : 'bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600'} text-white rounded-full`}
                        onClick={() => {
                          setAppointmentForm(prev => ({ ...prev, doctor: doctor.name, department: doctor.specialization }))
                          document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {t.doctors.bookAppointment}
                      </Button>
                      <Button variant="outline" className={`${doctor.isFounder ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' : doctor.isGynecologist ? 'border-purple-200 text-purple-600 hover:bg-purple-50' : 'border-pink-200 text-pink-600 hover:bg-pink-50'} rounded-full px-4`}>
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Show More Doctors Button */}
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full px-8 py-3 text-lg"
              onClick={() => {
                // You can implement a modal or expand functionality here
                alert('View all doctors functionality can be implemented here')
              }}
            >
              View All {doctors.length} Doctors
            </Button>
          </div>
        </div>
      </section>

      {/* Special Gynecology Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-12 rounded-full mb-6 relative">
                      <User className="h-20 w-20 text-white" />
                      {/* Baby icon overlay */}
                      <div className="absolute -bottom-2 -right-2 bg-pink-400 p-3 rounded-full">
                        <Heart className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Dr Niharika Nayak</h3>
                    <p className="text-purple-600 font-medium">Gynecologist</p>
                  </div>
                </div>
              </div>
              {/* Achievement Badge */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-lg border border-purple-100">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">{t.gynecology.achievementBadge}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="h-4 w-4 mr-2" />
                {t.gynecology.badge}
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.gynecology.title} 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"> {t.gynecology.titleHighlight}</span>
                {t.gynecology.titleEnd}
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                {t.gynecology.description}
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
                  <div className="text-3xl font-bold text-purple-600 mb-2">5000+</div>
                  <div className="text-gray-600">{t.gynecology.stats.deliveries}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100">
                  <div className="text-3xl font-bold text-pink-600 mb-2">10+</div>
                  <div className="text-gray-600">{t.gynecology.stats.experience}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
                  <div className="text-3xl font-bold text-purple-600 mb-2">7K+</div>
                  <div className="text-gray-600">{t.gynecology.stats.mothers}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100">
                  <div className="text-3xl font-bold text-pink-600 mb-2">4.9★</div>
                  <div className="text-gray-600">{t.gynecology.stats.rating}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white rounded-full px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    setAppointmentForm(prev => ({ ...prev, doctor: 'Dr Niharika Nayak', department: 'Gynecology' }))
                    document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {t.gynecology.bookConsultation}
                </Button>
                <Button size="lg" variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-8 py-4 text-lg">
                  <Phone className="h-5 w-5 mr-2" />
                  {t.gynecology.emergencyMaternity}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="h-4 w-4 mr-2" />
                {t.founder.badge}
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.founder.title} 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600"> {t.founder.titleHighlight}</span>
                {t.founder.titleEnd}
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                {t.founder.description}
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{t.founder.qualifications.title}</h3>
                    <p className="text-gray-600">{t.founder.qualifications.description}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{t.founder.vision.title}</h3>
                    <p className="text-gray-600">{t.founder.vision.description}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{t.founder.excellence.title}</h3>
                    <p className="text-gray-600">{t.founder.excellence.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-full px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    setAppointmentForm(prev => ({ ...prev, doctor: 'Dr G K Nayak', department: 'Orthopedics (Founder)' }))
                    document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {t.founder.meetFounder}
                </Button>
                <Button size="lg" variant="outline" className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 rounded-full px-8 py-4 text-lg">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  {t.founder.orthopedicConsultation}
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-12 rounded-full mb-6 relative">
                      <User className="h-20 w-20 text-white" />
                      {/* Founder crown icon */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-400 p-2 rounded-full">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Dr G K Nayak</h3>
                    <p className="text-yellow-600 font-medium">Founder & Chief Orthopedic Surgeon</p>
                  </div>
                </div>
              </div>
              {/* Founder Badge */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-lg border border-yellow-100">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{t.founder.founderBadge}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Booking Section */}
      <section id="appointment" className="py-20 bg-gradient-to-br from-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.appointment.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {t.appointment.subtitle}
            </p>
            {/* OPD Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <div className="bg-blue-100 p-1 rounded-full">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">
                  {language === 'hindi' 
                    ? 'नोट: यह फॉर्म केवल सर्जरी अपॉइंटमेंट के लिए है। सामान्य OPD के लिए कृपया सीधे अस्पताल में संपर्क करें।'
                    : 'Note: This form is for surgery appointments only. For general OPD consultations, please contact the hospital directly.'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Appointment Form */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-pink-100">
              <form onSubmit={handleAppointmentSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      {t.appointment.form.name} *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={appointmentForm.name}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      {t.appointment.form.phone} *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={appointmentForm.phone}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    {t.appointment.form.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={appointmentForm.email}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="department" className="text-gray-700 font-medium">
                      {t.appointment.form.department} *
                    </Label>
                    <Select 
                      value={appointmentForm.department} 
                      onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, department: value, doctor: '' }))}
                    >
                      <SelectTrigger className="mt-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                        <SelectValue placeholder="Choose department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="doctor" className="text-gray-700 font-medium">
                      {t.appointment.form.doctor} *
                    </Label>
                    <Select 
                      value={appointmentForm.doctor} 
                      onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, doctor: value }))}
                    >
                      <SelectTrigger className="mt-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                        <SelectValue placeholder="Choose doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors
                          .filter(doc => !appointmentForm.department || doc.specialization === appointmentForm.department)
                          .map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.name}>
                              {doctor.name} - {doctor.specialization}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="date" className="text-gray-700 font-medium">
                      {t.appointment.form.date} *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={appointmentForm.date}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time" className="text-gray-700 font-medium">
                      {t.appointment.form.time} *
                    </Label>
                    <Select 
                      value={appointmentForm.time} 
                      onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, time: value }))}
                    >
                      <SelectTrigger className="mt-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                        <SelectValue placeholder="Choose time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reason" className="text-gray-700 font-medium">
                    {t.appointment.form.reason}
                  </Label>
                  <Textarea
                    id="reason"
                    value={appointmentForm.reason}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="mt-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    placeholder="Describe the type of surgery needed, any specific concerns, or pre-surgical consultation requirements..."
                    rows={3}
                  />
                </div>
                
                {submitMessage && (
                  <div className={`p-4 rounded-lg text-center font-medium ${
                    submitMessage.includes(' ') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {submitMessage}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarDays className="h-5 w-5 mr-2" />
                  {isSubmitting ? t.appointment.form.submitting : t.appointment.form.submit}
                </Button>
              </form>
            </div>
            
            {/* Benefits */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-pink-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl mr-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  {t.appointment.benefits.title}
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">{t.appointment.benefits.noWaiting.title}</h4>
                      <p className="text-gray-600">{t.appointment.benefits.noWaiting.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">{t.appointment.benefits.confirmation.title}</h4>
                      <p className="text-gray-600">{t.appointment.benefits.confirmation.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Bell className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">{t.appointment.benefits.reminder.title}</h4>
                      <p className="text-gray-600">{t.appointment.benefits.reminder.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <RefreshCw className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">{t.appointment.benefits.reschedule.title}</h4>
                      <p className="text-gray-600">{t.appointment.benefits.reschedule.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Emergency Surgery Contact */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-3xl p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-500 p-2 rounded-xl mr-3">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {language === 'hindi' ? 'आपातकालीन सर्जरी?' : 'Emergency Surgery?'}
                  </h3>
                </div>
                <p className="mb-6 text-gray-700 leading-relaxed">
                  {language === 'hindi' 
                    ? 'आपातकालीन सर्जरी के लिए, अपॉइंटमेंट का इंतज़ार न करें। तुरंत हमारी आपातकालीन हेल्पलाइन पर कॉल करें।'
                    : 'For emergency surgeries, don\'t wait for an appointment. Call our emergency helpline immediately.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    <Phone className="h-4 w-4 mr-2" />
                    {language === 'hindi' ? 'आपातकालीन कॉल: +91 98765 43211' : 'Emergency Call: +91 98765 43211'}
                  </Button>
                  <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full font-semibold">
                    <Navigation className="h-4 w-4 mr-2" />
                    {language === 'hindi' ? 'दिशा निर्देश' : 'Get Directions'}
                  </Button>
                </div>
                
                {/* Additional Emergency Info */}
                <div className="mt-6 bg-white rounded-2xl p-4 border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {language === 'hindi' ? '24/7 आपातकालीन सेवा' : '24/7 Emergency Service'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'hindi' ? 'हमारी टीम हमेशा तैयार है' : 'Our team is always ready'}
                      </p>
                    </div>
                  </div>
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
                    allowFullScreen
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
