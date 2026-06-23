export interface ImprovedBullet {
  original: string;
  improved: string;
  explanation: string;
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  targetRole: string;
  atsScore: number; // 0-100
  recruiterReadiness: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  missingSkills: string[];
  formattingIssues: string[];
  suggestions: string[];
  improvedBullets: ImprovedBullet[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  analysisId: string;
  targetRole: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  analysesCount: number;
  maxAnalysesPerDay: number;
  isGuest: boolean;
  createdAt: string;
}
