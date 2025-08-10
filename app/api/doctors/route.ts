import { NextRequest, NextResponse } from 'next/server';

// Sample doctors data - in production, this would come from database
const doctorsData = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialization: "Cardiologist",
    department: "Cardiology",
    experience: "15 years",
    qualification: "MBBS, MD (Cardiology)",
    image: "/doctors/doctor1.jpg",
    rating: 4.8,
    patients: "2000+",
    availability: "Mon-Sat",
    languages: ["Hindi", "English"],
    about: "Expert in heart diseases, cardiac surgery, and preventive cardiology with over 15 years of experience.",
    consultationFee: 800,
    workingHours: {
      morning: "09:00 AM - 12:00 PM",
      evening: "05:00 PM - 08:00 PM"
    },
    isActive: true
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialization: "Gynecologist",
    department: "Gynecology",
    experience: "12 years",
    qualification: "MBBS, MS (Gynecology)",
    image: "/doctors/doctor2.jpg",
    rating: 4.9,
    patients: "1800+",
    availability: "Mon-Fri",
    languages: ["Hindi", "English"],
    about: "Specialized in women's health, pregnancy care, and minimally invasive gynecological procedures.",
    consultationFee: 700,
    workingHours: {
      morning: "10:00 AM - 01:00 PM",
      evening: "04:00 PM - 07:00 PM"
    },
    isActive: true
  },
  {
    id: 3,
    name: "Dr. Amit Patel",
    specialization: "Orthopedic Surgeon",
    department: "Orthopedics",
    experience: "18 years",
    qualification: "MBBS, MS (Orthopedics)",
    image: "/doctors/doctor3.jpg",
    rating: 4.7,
    patients: "2200+",
    availability: "Tue-Sun",
    languages: ["Hindi", "English", "Gujarati"],
    about: "Expert in joint replacement, sports injuries, and spine surgery with extensive surgical experience.",
    consultationFee: 900,
    workingHours: {
      morning: "08:00 AM - 12:00 PM",
      evening: "06:00 PM - 09:00 PM"
    },
    isActive: true
  },
  {
    id: 4,
    name: "Dr. Sunita Verma",
    specialization: "Pediatrician",
    department: "Pediatrics",
    experience: "10 years",
    qualification: "MBBS, MD (Pediatrics)",
    image: "/doctors/doctor4.jpg",
    rating: 4.9,
    patients: "1500+",
    availability: "Mon-Sat",
    languages: ["Hindi", "English"],
    about: "Dedicated to child healthcare, vaccination, and developmental pediatrics with a gentle approach.",
    consultationFee: 600,
    workingHours: {
      morning: "09:00 AM - 01:00 PM",
      evening: "05:00 PM - 08:00 PM"
    },
    isActive: true
  },
  {
    id: 5,
    name: "Dr. Vikram Singh",
    specialization: "General Physician",
    department: "General Medicine",
    experience: "20 years",
    qualification: "MBBS, MD (Internal Medicine)",
    image: "/doctors/doctor5.jpg",
    rating: 4.6,
    patients: "3000+",
    availability: "Mon-Sun",
    languages: ["Hindi", "English", "Punjabi"],
    about: "Experienced in treating common illnesses, preventive care, and managing chronic conditions.",
    consultationFee: 500,
    workingHours: {
      morning: "08:00 AM - 02:00 PM",
      evening: "04:00 PM - 10:00 PM"
    },
    isActive: true
  },
  {
    id: 6,
    name: "Dr. Neha Gupta",
    specialization: "Dermatologist",
    department: "Dermatology",
    experience: "8 years",
    qualification: "MBBS, MD (Dermatology)",
    image: "/doctors/doctor6.jpg",
    rating: 4.8,
    patients: "1200+",
    availability: "Mon-Fri",
    languages: ["Hindi", "English"],
    about: "Specialist in skin diseases, cosmetic dermatology, and advanced skin treatments.",
    consultationFee: 750,
    workingHours: {
      morning: "10:00 AM - 02:00 PM",
      evening: "05:00 PM - 08:00 PM"
    },
    isActive: true
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const specialization = searchParams.get('specialization');
    const isActive = searchParams.get('active');
    
    let filteredDoctors = doctorsData;
    
    // Filter by department
    if (department) {
      filteredDoctors = filteredDoctors.filter(
        doctor => doctor.department.toLowerCase() === department.toLowerCase()
      );
    }
    
    // Filter by specialization
    if (specialization) {
      filteredDoctors = filteredDoctors.filter(
        doctor => doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }
    
    // Filter by active status
    if (isActive !== null) {
      const activeStatus = isActive === 'true';
      filteredDoctors = filteredDoctors.filter(doctor => doctor.isActive === activeStatus);
    }
    
    // Sort by rating (highest first)
    filteredDoctors.sort((a, b) => b.rating - a.rating);
    
    return NextResponse.json({
      success: true,
      data: filteredDoctors,
      total: filteredDoctors.length,
      message: `Found ${filteredDoctors.length} doctors`
    });
    
  } catch (error) {
    console.error('Error fetching doctors:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch doctors list',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET specific doctor by ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId } = body;
    
    if (!doctorId) {
      return NextResponse.json({
        success: false,
        message: 'Doctor ID is required'
      }, { status: 400 });
    }
    
    const doctor = doctorsData.find(doc => doc.id === parseInt(doctorId));
    
    if (!doctor) {
      return NextResponse.json({
        success: false,
        message: 'Doctor not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: doctor,
      message: 'Doctor details retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch doctor details',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
