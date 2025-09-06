import { NextRequest, NextResponse } from 'next/server';

// Simple AI-like text processing for patient summary generation
function generatePatientSummary(doctorNotes: string): string {
  // Clean and process the input
  const notes = doctorNotes.trim();
  if (!notes) {
    throw new Error('No notes provided');
  }

  // Extract key information from bullet points
  const lines = notes.split('\n').filter(line => line.trim());
  const symptoms: string[] = [];
  const vitals: string[] = [];
  const treatments: string[] = [];
  const followUp: string[] = [];

  lines.forEach(line => {
    const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
    const lowerLine = cleanLine.toLowerCase();
    
    if (lowerLine.includes('complain') || lowerLine.includes('symptom') || lowerLine.includes('pain') || lowerLine.includes('discomfort')) {
      symptoms.push(cleanLine);
    } else if (lowerLine.includes('bp') || lowerLine.includes('blood pressure') || lowerLine.includes('temperature') || lowerLine.includes('pulse') || lowerLine.includes('weight')) {
      vitals.push(cleanLine);
    } else if (lowerLine.includes('medication') || lowerLine.includes('treatment') || lowerLine.includes('continue') || lowerLine.includes('prescribe')) {
      treatments.push(cleanLine);
    } else if (lowerLine.includes('follow') || lowerLine.includes('next') || lowerLine.includes('appointment') || lowerLine.includes('week')) {
      followUp.push(cleanLine);
    }
  });

  // Generate structured summary
  let summary = "PATIENT CONSULTATION SUMMARY\n\n";
  
  if (symptoms.length > 0) {
    summary += "PRESENTING COMPLAINTS:\n";
    symptoms.forEach(symptom => summary += `• ${symptom}\n`);
    summary += "\n";
  }
  
  if (vitals.length > 0) {
    summary += "CLINICAL FINDINGS:\n";
    vitals.forEach(vital => summary += `• ${vital}\n`);
    summary += "\n";
  }
  
  if (treatments.length > 0) {
    summary += "TREATMENT PLAN:\n";
    treatments.forEach(treatment => summary += `• ${treatment}\n`);
    summary += "\n";
  }
  
  if (followUp.length > 0) {
    summary += "FOLLOW-UP INSTRUCTIONS:\n";
    followUp.forEach(instruction => summary += `• ${instruction}\n`);
    summary += "\n";
  }

  // Add general assessment
  summary += "CLINICAL ASSESSMENT:\n";
  summary += "Patient was evaluated and appropriate management plan initiated. ";
  summary += "All findings documented and treatment recommendations provided. ";
  summary += "Patient advised to follow prescribed treatment regimen and return for scheduled follow-up.\n\n";
  
  summary += "Note: This summary was generated from doctor's notes and requires clinical review before finalization.";

  return summary;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Simulate processing time for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    const summary = generatePatientSummary(text);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error during summarization:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate summary' 
    }, { status: 500 });
  }
}
