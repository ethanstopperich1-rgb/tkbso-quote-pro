import { useState, useCallback } from 'react';
import {
  ProjectType,
  SmartQuestion,
  ScopeAnswers,
  getNextQuestion,
  formatQuestionForChat,
  parseQuestionResponse,
  hasEnoughAnswers,
  getScopeSummary,
} from '@/lib/smart-questions';
import { getProjectDefaults, ProjectDefaults } from '@/lib/project-defaults';

interface UseSmartQuestionsReturn {
  projectType: ProjectType | null;
  answers: ScopeAnswers;
  askedQuestions: string[];
  currentQuestion: SmartQuestion | null;
  isComplete: boolean;
  defaults: ProjectDefaults | null;
  
  // Actions
  setProjectType: (type: ProjectType) => string; // Returns welcome message for that project type
  processUserResponse: (response: string) => {
    understood: boolean;
    nextMessage: string;
    isComplete: boolean;
    scopeSummary?: string;
  };
  reset: () => void;
  skipToQuote: () => { scopeSummary: string; answers: ScopeAnswers };
}

export function useSmartQuestions(): UseSmartQuestionsReturn {
  const [projectType, setProjectTypeState] = useState<ProjectType | null>(null);
  const [answers, setAnswers] = useState<ScopeAnswers>({});
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<SmartQuestion | null>(null);
  const [defaults, setDefaults] = useState<ProjectDefaults | null>(null);

  const setProjectType = useCallback((type: ProjectType): string => {
    setProjectTypeState(type);
    setAnswers({ projectType: type });
    
    // Load defaults for this project type
    const projectDefaults = getProjectDefaults(type.toLowerCase() as 'bathroom' | 'kitchen');
    setDefaults(projectDefaults);
    
    // Get first question
    const firstQuestion = getNextQuestion(type, { projectType: type }, []);
    setCurrentQuestion(firstQuestion);
    
    if (firstQuestion) {
      setAskedQuestions([firstQuestion.key]);
      return formatQuestionForChat(firstQuestion);
    }
    
    return `Got it, ${type.toLowerCase()} remodel. Tell me more about the scope.`;
  }, []);

  const processUserResponse = useCallback((response: string): {
    understood: boolean;
    nextMessage: string;
    isComplete: boolean;
    scopeSummary?: string;
  } => {
    if (!projectType || !currentQuestion) {
      return {
        understood: false,
        nextMessage: "Is this a kitchen or bathroom project?",
        isComplete: false,
      };
    }

    // Parse the response
    const parsed = parseQuestionResponse(currentQuestion, response);
    
    if (!parsed) {
      // Couldn't parse - ask to clarify
      return {
        understood: false,
        nextMessage: `I didn't catch that. ${formatQuestionForChat(currentQuestion)}`,
        isComplete: false,
      };
    }

    // Update answers
    const newAnswers: ScopeAnswers = {
      ...answers,
      [currentQuestion.key]: parsed.value,
      ...(parsed.modifiers || {}),
    };
    setAnswers(newAnswers);

    // Check if we have enough to generate a quote
    const enough = hasEnoughAnswers(projectType, newAnswers);
    
    // Get next question
    const nextQ = getNextQuestion(projectType, newAnswers, askedQuestions);
    
    if (!nextQ) {
      // No more questions - we're done
      setCurrentQuestion(null);
      const summary = getScopeSummary(newAnswers);
      return {
        understood: true,
        nextMessage: `Got it! Here's what I have:\n\n**${summary}**\n\nLooks good? Say "generate quote" or tell me what else to add.`,
        isComplete: true,
        scopeSummary: summary,
      };
    }

    // Check condition for next question
    if (nextQ.condition && !nextQ.condition(newAnswers)) {
      // Skip this question, find next valid one
      const updatedAsked = [...askedQuestions, nextQ.key];
      setAskedQuestions(updatedAsked);
      const nextValidQ = getNextQuestion(projectType, newAnswers, updatedAsked);
      
      if (!nextValidQ) {
        setCurrentQuestion(null);
        const summary = getScopeSummary(newAnswers);
        return {
          understood: true,
          nextMessage: `Got it! Here's what I have:\n\n**${summary}**\n\nLooks good? Say "generate quote" or tell me what else to add.`,
          isComplete: true,
          scopeSummary: summary,
        };
      }
      
      setCurrentQuestion(nextValidQ);
      setAskedQuestions([...updatedAsked, nextValidQ.key]);
      return {
        understood: true,
        nextMessage: formatQuestionForChat(nextValidQ),
        isComplete: false,
      };
    }

    setCurrentQuestion(nextQ);
    setAskedQuestions([...askedQuestions, nextQ.key]);
    
    return {
      understood: true,
      nextMessage: formatQuestionForChat(nextQ),
      isComplete: false,
    };
  }, [projectType, currentQuestion, answers, askedQuestions]);

  const reset = useCallback(() => {
    setProjectTypeState(null);
    setAnswers({});
    setAskedQuestions([]);
    setCurrentQuestion(null);
    setDefaults(null);
  }, []);

  const skipToQuote = useCallback(() => {
    return {
      scopeSummary: getScopeSummary(answers),
      answers,
    };
  }, [answers]);

  return {
    projectType,
    answers,
    askedQuestions,
    currentQuestion,
    isComplete: !currentQuestion && askedQuestions.length > 0,
    defaults,
    setProjectType,
    processUserResponse,
    reset,
    skipToQuote,
  };
}
