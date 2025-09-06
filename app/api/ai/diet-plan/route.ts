import { NextRequest, NextResponse } from 'next/server';

// Diet plan generation based on medical conditions and requirements
function generateDietPlan(medicalNotes: string): string {
  const notes = medicalNotes.toLowerCase().trim();
  
  // Analyze medical conditions
  const conditions = {
    diabetes: notes.includes('diabetes') || notes.includes('diabetic') || notes.includes('blood sugar'),
    hypertension: notes.includes('hypertension') || notes.includes('high bp') || notes.includes('blood pressure'),
    heartDisease: notes.includes('heart') || notes.includes('cardiac') || notes.includes('cholesterol'),
    kidneyDisease: notes.includes('kidney') || notes.includes('renal'),
    obesity: notes.includes('obesity') || notes.includes('overweight') || notes.includes('weight loss'),
    anemia: notes.includes('anemia') || notes.includes('iron deficiency'),
    gastric: notes.includes('gastric') || notes.includes('acidity') || notes.includes('stomach'),
    pregnancy: notes.includes('pregnant') || notes.includes('pregnancy'),
    elderly: notes.includes('elderly') || notes.includes('old age') || notes.includes('senior')
  };

  let dietPlan = "PERSONALIZED DIET PLAN\n";
  dietPlan += "======================\n\n";

  // Breakfast recommendations
  dietPlan += "BREAKFAST (7:00 - 8:00 AM):\n";
  if (conditions.diabetes) {
    dietPlan += "• 1 bowl oats with nuts and seeds (no sugar)\n";
    dietPlan += "• 1 cup unsweetened almond milk\n";
    dietPlan += "• 1 small apple or berries\n";
  } else if (conditions.hypertension) {
    dietPlan += "• 1 bowl whole grain cereal with low-fat milk\n";
    dietPlan += "• 1 banana (rich in potassium)\n";
    dietPlan += "• Herbal tea (avoid caffeine)\n";
  } else {
    dietPlan += "• 2 whole wheat bread slices with peanut butter\n";
    dietPlan += "• 1 glass milk\n";
    dietPlan += "• 1 seasonal fruit\n";
  }
  dietPlan += "\n";

  // Mid-morning snack
  dietPlan += "MID-MORNING SNACK (10:00 - 10:30 AM):\n";
  if (conditions.diabetes) {
    dietPlan += "• Handful of almonds (5-6 pieces)\n";
    dietPlan += "• Green tea without sugar\n";
  } else {
    dietPlan += "• 1 cup buttermilk\n";
    dietPlan += "• 2-3 dates or 1 small fruit\n";
  }
  dietPlan += "\n";

  // Lunch recommendations
  dietPlan += "LUNCH (12:30 - 1:30 PM):\n";
  if (conditions.diabetes) {
    dietPlan += "• 1 small bowl brown rice\n";
    dietPlan += "• Dal (lentils) - 1 bowl\n";
    dietPlan += "• Mixed vegetable curry (low oil)\n";
    dietPlan += "• Salad with cucumber, tomato, onion\n";
  } else if (conditions.hypertension) {
    dietPlan += "• 2 chapati (whole wheat)\n";
    dietPlan += "• Dal without extra salt\n";
    dietPlan += "• Steamed vegetables\n";
    dietPlan += "• 1 cup curd (low sodium)\n";
  } else {
    dietPlan += "• 2-3 chapati or 1 bowl rice\n";
    dietPlan += "• Dal or chicken curry\n";
    dietPlan += "• Seasonal vegetables\n";
    dietPlan += "• Salad and curd\n";
  }
  dietPlan += "\n";

  // Evening snack
  dietPlan += "EVENING SNACK (4:00 - 5:00 PM):\n";
  if (conditions.diabetes) {
    dietPlan += "• 1 cup green tea\n";
    dietPlan += "• 2-3 whole grain biscuits (sugar-free)\n";
  } else {
    dietPlan += "• 1 cup tea with minimal sugar\n";
    dietPlan += "• 2-3 biscuits or 1 small sandwich\n";
  }
  dietPlan += "\n";

  // Dinner recommendations
  dietPlan += "DINNER (7:00 - 8:00 PM):\n";
  if (conditions.diabetes) {
    dietPlan += "• 2 chapati (wheat)\n";
    dietPlan += "• Grilled fish or chicken (small portion)\n";
    dietPlan += "• Steamed vegetables\n";
    dietPlan += "• Clear soup\n";
  } else if (conditions.hypertension) {
    dietPlan += "• Light dinner with minimal salt\n";
    dietPlan += "• 1-2 chapati\n";
    dietPlan += "• Dal or light curry\n";
    dietPlan += "• Steamed vegetables\n";
  } else {
    dietPlan += "• 2 chapati or light rice\n";
    dietPlan += "• Dal or light curry\n";
    dietPlan += "• Vegetables\n";
    dietPlan += "• 1 glass milk before bed\n";
  }
  dietPlan += "\n";

  // Special dietary guidelines
  dietPlan += "DIETARY GUIDELINES:\n";
  if (conditions.diabetes) {
    dietPlan += "• Avoid sugar, sweets, and refined carbs\n";
    dietPlan += "• Include fiber-rich foods\n";
    dietPlan += "• Monitor portion sizes\n";
    dietPlan += "• Eat at regular intervals\n";
  }
  if (conditions.hypertension) {
    dietPlan += "• Limit sodium intake (less than 2g/day)\n";
    dietPlan += "• Include potassium-rich foods\n";
    dietPlan += "• Avoid processed foods\n";
    dietPlan += "• Limit caffeine\n";
  }
  if (conditions.heartDisease) {
    dietPlan += "• Reduce saturated fats\n";
    dietPlan += "• Include omega-3 rich foods\n";
    dietPlan += "• Avoid trans fats\n";
  }
  
  dietPlan += "• Drink 8-10 glasses of water daily\n";
  dietPlan += "• Include 30 minutes of light exercise\n";
  dietPlan += "• Avoid late night eating\n\n";

  dietPlan += "FOODS TO AVOID:\n";
  if (conditions.diabetes) {
    dietPlan += "• Sugar, honey, jaggery\n• White rice, white bread\n• Fried foods\n• Soft drinks\n";
  }
  if (conditions.hypertension) {
    dietPlan += "• Excess salt and pickles\n• Processed meats\n• Canned foods\n• Alcohol\n";
  }
  dietPlan += "\n";

  dietPlan += "Note: This diet plan is generated based on the provided medical information.\n";
  dietPlan += "Please consult with a nutritionist for personalized recommendations.\n";
  dietPlan += "Adjust portions based on age, weight, and activity level.";

  return dietPlan;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Medical notes are required' }, { status: 400 });
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const dietPlan = generateDietPlan(text);

    return NextResponse.json({ dietPlan });
  } catch (error) {
    console.error('Error during diet plan generation:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate diet plan' 
    }, { status: 500 });
  }
}
