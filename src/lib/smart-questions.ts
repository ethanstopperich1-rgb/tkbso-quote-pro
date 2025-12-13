/**
 * Layer 2: Smart Conversational Questions
 * Asks follow-up questions like a good salesperson on a site visit
 */

export type ProjectType = 'Bathroom' | 'Kitchen';

export interface QuestionOption {
  label: string;
  value: string;
  followUp?: string; // Key of next question to ask
  modifiers?: Record<string, any>; // Values to set in scope
}

export interface SmartQuestion {
  key: string;
  question: string;
  options?: QuestionOption[];
  freeformAllowed?: boolean;
  category: 'setup' | 'scope' | 'materials' | 'complexity' | 'premium';
  appliesTo: ProjectType[];
  condition?: (scope: ScopeAnswers) => boolean; // Only show if condition is true
}

export interface ScopeAnswers {
  projectType?: ProjectType;
  roomType?: string; // primary, guest, half, galley, open-concept
  currentSetup?: string; // tub_shower_combo, walk_in, no_shower
  desiredSetup?: string; // keep_tub, convert_walk_in, expand_shower
  wallChanges?: string; // yes, no, unsure
  loadBearing?: string; // yes, no, unsure
  vanitySize?: string;
  vanityType?: string; // single, double
  countertopMaterial?: string;
  floorTileScope?: string; // wet_area, whole_room
  doorType?: string; // pocket, standard, barn
  paintScope?: string; // bathroom_only, adjacent_rooms
  electricalAdds?: string[];
  cabinetStyle?: string;
  backsplashScope?: string;
  applianceChanges?: string; // yes, no
  [key: string]: any;
}

// Bathroom-specific questions
const BATHROOM_QUESTIONS: SmartQuestion[] = [
  {
    key: 'roomType',
    question: 'Is this a primary bathroom, guest bath, or half bath?',
    options: [
      { label: 'Primary', value: 'primary' },
      { label: 'Guest', value: 'guest' },
      { label: 'Half bath', value: 'half' },
    ],
    category: 'setup',
    appliesTo: ['Bathroom'],
  },
  {
    key: 'currentSetup',
    question: "What's the current shower setup?",
    options: [
      { label: 'Tub/shower combo', value: 'tub_shower_combo' },
      { label: 'Walk-in shower', value: 'walk_in' },
      { label: 'No shower (adding one)', value: 'no_shower' },
      { label: 'Tub only', value: 'tub_only' },
    ],
    category: 'setup',
    appliesTo: ['Bathroom'],
    condition: (scope) => scope.roomType !== 'half',
  },
  {
    key: 'desiredSetup',
    question: 'What do they want instead?',
    options: [
      { label: 'Keep tub, update finishes', value: 'keep_tub' },
      { label: 'Convert to walk-in shower', value: 'convert_walk_in' },
      { label: 'Larger walk-in shower (expanding footprint)', value: 'expand_shower' },
    ],
    category: 'scope',
    appliesTo: ['Bathroom'],
    condition: (scope) => scope.currentSetup === 'tub_shower_combo',
  },
  {
    key: 'wallChanges',
    question: 'Any walls coming down or being added?',
    options: [
      { label: 'Yes', value: 'yes', modifiers: { hasStructuralWork: true } },
      { label: 'No', value: 'no' },
      { label: 'Not sure yet', value: 'unsure' },
    ],
    category: 'complexity',
    appliesTo: ['Bathroom'],
  },
  {
    key: 'loadBearing',
    question: "That usually means structural work. Is there a header above that wall or is it load-bearing?",
    options: [
      { label: 'Yes, load-bearing', value: 'yes', modifiers: { needsStructuralEngineer: true } },
      { label: 'No, not load-bearing', value: 'no' },
      { label: 'Not sure', value: 'unsure', modifiers: { flagForVerification: 'structural' } },
    ],
    category: 'complexity',
    appliesTo: ['Bathroom'],
    condition: (scope) => scope.wallChanges === 'yes',
  },
  {
    key: 'vanitySize',
    question: "What about the vanity situation? What size are we looking at?",
    options: [
      { label: '24-30"', value: '30' },
      { label: '36"', value: '36' },
      { label: '48"', value: '48' },
      { label: '60" double', value: '60' },
      { label: '72" double', value: '72' },
      { label: 'Keeping existing', value: 'existing' },
    ],
    freeformAllowed: true,
    category: 'scope',
    appliesTo: ['Bathroom'],
    condition: (scope) => scope.roomType !== 'half',
  },
  {
    key: 'countertopMaterial',
    question: 'Quartz top?',
    options: [
      { label: 'Yes, Level 1 quartz', value: 'quartz_l1' },
      { label: 'Yes, Level 2+ quartz', value: 'quartz_l2' },
      { label: 'Granite', value: 'granite' },
      { label: 'Laminate', value: 'laminate' },
      { label: 'Comes with vanity', value: 'included' },
    ],
    category: 'materials',
    appliesTo: ['Bathroom'],
    condition: (scope) => scope.vanitySize && scope.vanitySize !== 'existing',
  },
  {
    key: 'floorTileScope',
    question: 'Are we tiling the whole bathroom floor or just the wet area?',
    options: [
      { label: 'Whole bathroom', value: 'whole_room' },
      { label: 'Just wet area', value: 'wet_area' },
      { label: 'No floor tile (using LVP)', value: 'lvp' },
    ],
    category: 'scope',
    appliesTo: ['Bathroom'],
  },
  {
    key: 'doorType',
    question: 'Pocket door or standard door?',
    options: [
      { label: 'Pocket door', value: 'pocket', modifiers: { hasFramingWork: true } },
      { label: 'Standard swing door', value: 'standard' },
      { label: 'Barn door', value: 'barn' },
      { label: 'Keeping existing', value: 'existing' },
    ],
    category: 'scope',
    appliesTo: ['Bathroom'],
  },
  {
    key: 'electricalAdds',
    question: 'Any electrical adds? Can lights, heated floor, outlet adds?',
    options: [
      { label: 'Recessed lights', value: 'can_lights' },
      { label: 'Heated floor', value: 'heated_floor' },
      { label: 'Additional outlets', value: 'outlets' },
      { label: 'Exhaust fan upgrade', value: 'exhaust_fan' },
      { label: 'None', value: 'none' },
    ],
    freeformAllowed: true,
    category: 'scope',
    appliesTo: ['Bathroom'],
  },
  {
    key: 'glassType',
    question: 'What type of shower glass?',
    options: [
      { label: 'Frameless glass door + panel', value: 'frameless_door_panel' },
      { label: 'Frameless panel only', value: 'frameless_panel' },
      { label: '90° return enclosure', value: '90_return' },
      { label: 'Shower curtain', value: 'curtain' },
    ],
    category: 'materials',
    appliesTo: ['Bathroom'],
    condition: (scope) => scope.desiredSetup === 'convert_walk_in' || scope.desiredSetup === 'expand_shower' || scope.currentSetup === 'walk_in',
  },
];

// Kitchen-specific questions
const KITCHEN_QUESTIONS: SmartQuestion[] = [
  {
    key: 'layoutType',
    question: 'What type of kitchen layout?',
    options: [
      { label: 'Galley', value: 'galley' },
      { label: 'L-shaped', value: 'l_shaped' },
      { label: 'U-shaped', value: 'u_shaped' },
      { label: 'Open concept with island', value: 'island' },
    ],
    category: 'setup',
    appliesTo: ['Kitchen'],
  },
  {
    key: 'cabinetScope',
    question: 'What are we doing with cabinets?',
    options: [
      { label: 'Full replacement', value: 'full_replace' },
      { label: 'Reface existing', value: 'reface' },
      { label: 'Paint existing', value: 'paint' },
      { label: 'Keep as-is', value: 'keep' },
    ],
    category: 'scope',
    appliesTo: ['Kitchen'],
  },
  {
    key: 'cabinetLinearFeet',
    question: 'How many linear feet of cabinets?',
    options: [
      { label: '15-20 LF', value: '18' },
      { label: '20-25 LF', value: '22' },
      { label: '25-30 LF', value: '28' },
      { label: '30+ LF', value: '35' },
    ],
    freeformAllowed: true,
    category: 'scope',
    appliesTo: ['Kitchen'],
    condition: (scope) => scope.cabinetScope === 'full_replace',
  },
  {
    key: 'countertopMaterial',
    question: 'What countertop material?',
    options: [
      { label: 'Quartz Level 1', value: 'quartz_l1' },
      { label: 'Quartz Level 2+', value: 'quartz_l2' },
      { label: 'Granite', value: 'granite' },
      { label: 'Butcher block', value: 'butcher_block' },
      { label: 'Laminate', value: 'laminate' },
    ],
    category: 'materials',
    appliesTo: ['Kitchen'],
  },
  {
    key: 'backsplashScope',
    question: 'Backsplash?',
    options: [
      { label: 'Full tile backsplash', value: 'full' },
      { label: 'Just behind stove', value: 'stove_only' },
      { label: 'No backsplash', value: 'none' },
    ],
    category: 'scope',
    appliesTo: ['Kitchen'],
  },
  {
    key: 'applianceChanges',
    question: 'Any appliance changes that affect layout?',
    options: [
      { label: 'Yes, adding/moving appliances', value: 'yes', modifiers: { hasElectricalWork: true } },
      { label: 'No, same layout', value: 'no' },
    ],
    category: 'complexity',
    appliesTo: ['Kitchen'],
  },
  {
    key: 'wallChanges',
    question: 'Any walls coming down? Opening up to living room?',
    options: [
      { label: 'Yes', value: 'yes', modifiers: { hasStructuralWork: true } },
      { label: 'No', value: 'no' },
    ],
    category: 'complexity',
    appliesTo: ['Kitchen'],
  },
  {
    key: 'flooringScope',
    question: 'What about flooring?',
    options: [
      { label: 'Tile', value: 'tile' },
      { label: 'LVP', value: 'lvp' },
      { label: 'Hardwood', value: 'hardwood' },
      { label: 'Keep existing', value: 'keep' },
    ],
    category: 'scope',
    appliesTo: ['Kitchen'],
  },
  {
    key: 'electricalAdds',
    question: 'Electrical upgrades? Under-cabinet lights, recessed cans?',
    options: [
      { label: 'Recessed lighting', value: 'can_lights' },
      { label: 'Under-cabinet lights', value: 'under_cabinet' },
      { label: 'Pendant lights', value: 'pendants' },
      { label: 'None', value: 'none' },
    ],
    freeformAllowed: true,
    category: 'scope',
    appliesTo: ['Kitchen'],
  },
];

// Get all questions for a project type
export function getQuestionsForProject(projectType: ProjectType): SmartQuestion[] {
  const questions = projectType === 'Bathroom' ? BATHROOM_QUESTIONS : KITCHEN_QUESTIONS;
  return questions;
}

// Get next question based on current answers
export function getNextQuestion(
  projectType: ProjectType,
  answers: ScopeAnswers,
  askedQuestions: string[]
): SmartQuestion | null {
  const questions = getQuestionsForProject(projectType);
  
  for (const question of questions) {
    // Skip if already asked
    if (askedQuestions.includes(question.key)) continue;
    
    // Check condition
    if (question.condition && !question.condition(answers)) continue;
    
    return question;
  }
  
  return null;
}

// Format question for chat display
export function formatQuestionForChat(question: SmartQuestion): string {
  if (!question.options) {
    return question.question;
  }
  
  const optionsList = question.options.map(opt => `• ${opt.label}`).join('\n');
  return `${question.question}\n\n${optionsList}`;
}

// Parse user response to a question
export function parseQuestionResponse(
  question: SmartQuestion,
  userResponse: string
): { value: string | string[]; modifiers?: Record<string, any> } | null {
  const response = userResponse.toLowerCase().trim();
  
  if (!question.options) {
    return { value: response };
  }
  
  // Try to match response to an option
  for (const option of question.options) {
    const label = option.label.toLowerCase();
    const value = option.value.toLowerCase();
    
    if (
      response.includes(label) ||
      response.includes(value) ||
      response === label ||
      response === value
    ) {
      return { 
        value: option.value, 
        modifiers: option.modifiers 
      };
    }
  }
  
  // Check for yes/no responses
  if (response === 'yes' || response === 'yeah' || response === 'yep' || response === 'y') {
    const yesOption = question.options.find(o => o.value === 'yes' || o.label.toLowerCase() === 'yes');
    if (yesOption) return { value: yesOption.value, modifiers: yesOption.modifiers };
  }
  
  if (response === 'no' || response === 'nope' || response === 'nah' || response === 'n') {
    const noOption = question.options.find(o => o.value === 'no' || o.label.toLowerCase() === 'no');
    if (noOption) return { value: noOption.value, modifiers: noOption.modifiers };
  }
  
  // For freeform allowed questions, accept any input
  if (question.freeformAllowed) {
    return { value: response };
  }
  
  return null;
}

// Check if we have enough answers to generate a quote
export function hasEnoughAnswers(
  projectType: ProjectType,
  answers: ScopeAnswers
): boolean {
  if (projectType === 'Bathroom') {
    // Minimum: room type, current setup (if not half bath), desired setup or scope indication
    return !!(
      answers.roomType &&
      (answers.roomType === 'half' || answers.currentSetup)
    );
  }
  
  if (projectType === 'Kitchen') {
    // Minimum: layout type, cabinet scope
    return !!(answers.layoutType && answers.cabinetScope);
  }
  
  return false;
}

// Get summary of scope from answers
export function getScopeSummary(answers: ScopeAnswers): string {
  const parts: string[] = [];
  
  if (answers.roomType) {
    parts.push(`${answers.roomType} bathroom`);
  }
  if (answers.currentSetup) {
    parts.push(`current: ${answers.currentSetup.replace(/_/g, ' ')}`);
  }
  if (answers.desiredSetup) {
    parts.push(`→ ${answers.desiredSetup.replace(/_/g, ' ')}`);
  }
  if (answers.vanitySize) {
    parts.push(`${answers.vanitySize}" vanity`);
  }
  if (answers.wallChanges === 'yes') {
    parts.push('wall work');
  }
  
  return parts.join(', ');
}
