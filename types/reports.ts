import { AnalysisResult } from "./analysis";

// Resume Report (stored in resume_reports table)
export interface ResumeReport {
  id: string;
  user_id: string;
  file_name: string;
  resume_text?: string;
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  suggestions: string[];
  job_role: string;
  report_url?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

// Shared Report Link
export interface SharedReport {
  id: string;
  report_id: string;
  user_id: string;
  share_token: string;
  expires_at: string | null;
  created_at: string;
}

// Job Description Match Result
export interface JobMatchResult {
  matchPercentage: number;
  keywordMatches: { keyword: string; found: boolean }[];
  missingSkills: string[];
  recommendations: string[];
  jdKeywords: string[];
  resumeKeywords: string[];
}

// Resume Comparison Result
export interface ComparisonResult {
  resume1: { id: string; fileName: string; atsScore: number; skills: string[]; keywords: string[] };
  resume2: { id: string; fileName: string; atsScore: number; skills: string[]; keywords: string[] };
  scoreDifference: number;
  improvementPercentage: number;
  newSkillsAdded: string[];
  missingKeywordsFixed: string[];
  remainingGaps: string[];
}

// Admin Stats
export interface AdminStats {
  totalUsers: number;
  totalReports: number;
  totalDownloads: number;
  averageAtsScore: number;
  dailyActiveUsers: number;
  topSkills: { skill: string; count: number }[];
  topJobRoles: { role: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  reportsPerDay: { date: string; count: number }[];
  downloadsPerDay: { date: string; count: number }[];
}

// Dashboard Stats
export interface DashboardStats {
  totalResumesAnalyzed: number;
  averageAtsScore: number;
  highestAtsScore: number;
  resumesImproved: number;
  lastAnalysisDate: string | null;
  totalReportsDownloaded: number;
}
