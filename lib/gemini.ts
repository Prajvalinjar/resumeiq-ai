import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, ChatMessage } from "@/types/analysis";

const apiKey = process.env.GEMINI_API_KEY || "";
export const isGeminiConfigured = !!apiKey;

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

// Standard skill lists per target role for fallback evaluation
const ROLE_SKILLS: Record<string, string[]> = {
  "Data Analyst": ["SQL", "Power BI", "Tableau", "Python", "Excel", "Pandas", "Statistics", "Data Visualization", "A/B Testing"],
  "Data Scientist": ["Python", "R", "Machine Learning", "Deep Learning", "SQL", "Statistics", "Pandas", "Scikit-Learn", "TensorFlow", "NLP"],
  "Software Engineer": ["Java", "C++", "Python", "Data Structures", "Algorithms", "Git", "System Design", "OOP", "Testing"],
  "Frontend Developer": ["JavaScript", "React", "CSS", "HTML", "TypeScript", "Tailwind CSS", "Next.js", "Redux", "Web Performance"],
  "Backend Developer": ["Node.js", "Express", "PostgreSQL", "MongoDB", "Docker", "APIs", "Python", "Go", "Redis", "Microservices"],
  "Full Stack Developer": ["JavaScript", "React", "Node.js", "Next.js", "PostgreSQL", "Tailwind CSS", "TypeScript", "REST APIs", "System Design"]
};

// Realistic mock generator for resumes
function generateMockAnalysis(resumeText: string, targetRole: string, fileName: string, fileSize: number): AnalysisResult {
  const skillsList = ROLE_SKILLS[targetRole] || ["Communication", "Problem Solving", "Project Management"];
  
  // Clean up and lowercase text for check
  const textLower = resumeText.toLowerCase();
  
  // Find which target skills are in the resume
  const presentSkills = skillsList.filter(skill => textLower.includes(skill.toLowerCase()));
  const missingSkills = skillsList.filter(skill => !textLower.includes(skill.toLowerCase()));
  
  // Simple heuristic for score
  const matchRatio = skillsList.length > 0 ? presentSkills.length / skillsList.length : 0.5;
  const atsScore = Math.min(100, Math.max(35, Math.round(40 + (matchRatio * 50) + (presentSkills.length > 0 ? 5 : 0))));
  const recruiterReadiness = Math.min(100, Math.max(30, Math.round(atsScore - 5 + Math.random() * 10)));
  
  // Detect formatting checks
  const formattingIssues: string[] = [];
  if (resumeText.length < 500) formattingIssues.push("Resume is too short, please expand on your experiences.");
  if (!textLower.includes("education")) formattingIssues.push("Missing a clear 'Education' section.");
  if (!textLower.includes("experience") && !textLower.includes("project")) formattingIssues.push("Missing a clear 'Experience' or 'Projects' section.");
  if (!textLower.includes("contact") && !textLower.includes("email") && !textLower.includes("@")) formattingIssues.push("Contact information might be incomplete (missing email).");
  
  // Identify strengths
  const strengths: string[] = [];
  if (presentSkills.length > 3) {
    strengths.push(`Good keyword match for core role skills like: ${presentSkills.slice(0, 3).join(", ")}.`);
  } else {
    strengths.push("Clear and clean section layout detected.");
  }
  if (textLower.includes("project")) strengths.push("Includes a dedicated Projects section demonstrating practical application.");
  if (textLower.includes("education")) strengths.push("Education background is clearly presented.");
  if (atsScore > 75) strengths.push("Good balance of action verbs and technical terminology.");

  // Identify weaknesses
  const weaknesses: string[] = [];
  if (missingSkills.length > 2) {
    weaknesses.push(`Missing critical industry keywords like: ${missingSkills.slice(0, 2).join(", ")}.`);
  }
  
  // Check if bullet points lack numbers/metrics
  const hasNumbers = /\d+/.test(resumeText);
  if (!hasNumbers) {
    weaknesses.push("Lack of quantifiable achievements (e.g. percentages, dollar values, headcount).");
  }
  
  if (formattingIssues.length > 0) {
    weaknesses.push(`Found ${formattingIssues.length} formatting warnings that could disrupt ATS parsers.`);
  }

  // Missing keywords
  const missingKeywords = [...missingSkills];
  if (!textLower.includes("optimized")) missingKeywords.push("Optimization");
  if (!textLower.includes("led") && !textLower.includes("managed")) missingKeywords.push("Leadership");
  if (!textLower.includes("collaborated")) missingKeywords.push("Cross-functional Collaboration");
  
  // Suggestions
  const suggestions: string[] = [
    `Integrate missing keywords: ${missingSkills.slice(0, 3).join(", ")} into your project descriptions.`,
  ];
  if (!hasNumbers) {
    suggestions.push("Quantify your achievements. Change 'Responsible for maintaining the app' to 'Maintained mobile app with 10k+ monthly active users, improving crash-free rate by 15%'.");
  }
  suggestions.push("Use strong action verbs at the start of each bullet point (e.g. Architected, Developed, Formulated, Orchestrated).");
  if (formattingIssues.length > 0) {
    suggestions.push("Resolve structural formatting issues. Use simple tables or list blocks instead of multi-column layouts which confuse some older ATS platforms.");
  }

  // Improved bullets
  const improvedBullets = [
    {
      original: "Worked on the team database and wrote queries.",
      improved: `Designed and optimized PostgreSQL database queries for a team project, reducing query response times by 32% using index tuning.`,
      explanation: "Replaced passive verb 'Worked' with 'Designed and optimized', added metrics, and named specific technology database details (PostgreSQL)."
    },
    {
      original: "Responsible for making the frontend using React.",
      improved: `Architected and built the frontend dashboard using React and TypeScript, improving page load speeds by 45% using code-splitting.`,
      explanation: "Replaced duty statement with active achievement. Quantified the result and highlighted modern practices (TypeScript, code-splitting)."
    }
  ];

  return {
    id: `anl-${Math.random().toString(36).substr(2, 9)}`,
    fileName,
    fileSize,
    targetRole,
    atsScore,
    recruiterReadiness,
    strengths,
    weaknesses,
    missingKeywords: missingKeywords.slice(0, 5),
    missingSkills: missingSkills.slice(0, 6),
    formattingIssues,
    suggestions,
    improvedBullets,
    createdAt: new Date().toISOString()
  };
}

export async function analyzeResume(resumeText: string, targetRole: string, fileName: string, fileSize: number): Promise<AnalysisResult> {
  if (!isGeminiConfigured || !genAI) {
    console.log("Gemini API key not found. Using local mock analysis engine.");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return generateMockAnalysis(resumeText, targetRole, fileName, fileSize);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert recruiter and ATS (Applicant Tracking System) scanner.
      Analyze the following resume text against the target role of "${targetRole}".
      
      Resume Text:
      """
      ${resumeText}
      """

      Provide a thorough evaluation. You MUST return your response as a JSON object matching this exact schema:
      {
        "atsScore": number, // integer from 0 to 100 representing ATS match score
        "recruiterReadiness": number, // integer from 0 to 100 representing how ready the resume is for a human recruiter
        "strengths": string[], // list of 2-4 strong points of the resume for this role
        "weaknesses": string[], // list of 2-4 weak points or gaps
        "missingKeywords": string[], // list of 3-5 specific keywords/terms relevant to targetRole missing from the resume
        "missingSkills": string[], // list of 3-6 technical or soft skills relevant to targetRole missing from the resume
        "formattingIssues": string[], // list of 0-3 layout or formatting criticisms
        "suggestions": string[], // list of 3-5 action items to improve the resume
        "improvedBullets": [ // list of 2 rewrite suggestions for bullet points
          {
            "original": string, // standard weak bullet from resume, or general example based on resume content
            "improved": string, // rewritten bullet point using action verbs, context, and quantified metric
            "explanation": string // why the improvement is better
          }
        ]
      }

      Ensure the JSON is valid and strictly structured. Do not include markdown codeblocks, comments, or extra text, just the raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText.trim());

    return {
      id: `anl-${Math.random().toString(36).substr(2, 9)}`,
      fileName,
      fileSize,
      targetRole,
      atsScore: parsedData.atsScore || 70,
      recruiterReadiness: parsedData.recruiterReadiness || 65,
      strengths: parsedData.strengths || [],
      weaknesses: parsedData.weaknesses || [],
      missingKeywords: parsedData.missingKeywords || [],
      missingSkills: parsedData.missingSkills || [],
      formattingIssues: parsedData.formattingIssues || [],
      suggestions: parsedData.suggestions || [],
      improvedBullets: parsedData.improvedBullets || [],
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error invoking Gemini API:", error);
    // Return mock analysis in case of API failure
    return generateMockAnalysis(resumeText, targetRole, fileName, fileSize);
  }
}

export async function chatWithCoach(
  messages: ChatMessage[],
  newMessage: string,
  analysisResult: AnalysisResult
): Promise<string> {
  if (!isGeminiConfigured || !genAI) {
    console.log("Gemini API key not found. Using local mock coach response.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerMessage = newMessage.toLowerCase();
    
    if (lowerMessage.includes("skills") || lowerMessage.includes("missing")) {
      return `For the **${analysisResult.targetRole}** role, your resume is currently missing: **${analysisResult.missingSkills.join(", ")}**. I suggest building a mini-project focusing on at least one of these (e.g. a dashboard with ${analysisResult.missingSkills[0] || "SQL"}) and adding it to your projects section.`;
    }
    if (lowerMessage.includes("ats") || lowerMessage.includes("score")) {
      return `Your current ATS Score is **${analysisResult.atsScore}%**. To boost it above 85%, focus on integrating: **${analysisResult.missingKeywords.join(", ")}**. Also, ensure you rewrite your bullet points to start with action verbs and include metrics (e.g. numbers, time saved, revenue generated).`;
    }
    if (lowerMessage.includes("project") || lowerMessage.includes("build")) {
      return `Since you are targeting a **${analysisResult.targetRole}** position, here are two project ideas to strengthen your resume:
1. **Industry Dashboard**: Build a web application using React and integrate a database. Highlight metrics like 'reduces query speeds by 30%'.
2. **Automated Pipeline**: Create a script that automates a daily task (like web scraping or ETL). Add it as a bullet point describing the technologies and volume of data handled.`;
    }
    
    return `Hi! As your ResumeIQ AI Career Coach, I've analyzed your resume for the **${analysisResult.targetRole}** position. 
    
Currently, your ATS match score is **${analysisResult.atsScore}%**. To improve your resume, I recommend:
- Resolving the warning: "${analysisResult.formattingIssues[0] || "Formatting optimization"}"
- Quantifying your accomplishments with numbers.
- Adding **${analysisResult.missingSkills.slice(0, 2).join(" and ")}** to your resume.

What specific section or bullet point would you like me to help you rewrite?`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format chat history for Gemini
    const formattedHistory = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Add system context as the introduction
    const contextPrompt = `
      You are an expert AI Career Coach for the ResumeIQ AI platform.
      The user is asking questions about how to improve their resume or career opportunities.
      Here is the user's analyzed resume context:
      - Target Role: ${analysisResult.targetRole}
      - ATS Match Score: ${analysisResult.atsScore}%
      - Recruiter Readiness Score: ${analysisResult.recruiterReadiness}%
      - Resume Strengths: ${analysisResult.strengths.join(", ")}
      - Resume Weaknesses: ${analysisResult.weaknesses.join(", ")}
      - Missing Skills: ${analysisResult.missingSkills.join(", ")}
      - Missing Keywords: ${analysisResult.missingKeywords.join(", ")}
      - Suggestions: ${analysisResult.suggestions.join(", ")}
      
      Respond directly, conversationally, and helpfully. Keep answers actionable, professional, and relatively concise. Make suggestions tailored to their target role.
    `;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `Here is the context of my resume analysis: ${contextPrompt}. Hello Coach!` }]
        },
        {
          role: "model",
          parts: [{ text: `Hello! I am your ResumeIQ AI Career Coach. I've reviewed your resume analysis for the ${analysisResult.targetRole} role. How can I help you improve your resume, add missing keywords, or build relevant projects today?` }]
        },
        ...formattedHistory
      ]
    });

    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error("Error invoking Gemini Coach API:", error);
    return "I apologize, but I encountered an error. How else can I assist you with your career goals today?";
  }
}
