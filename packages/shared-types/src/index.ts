export type IntentType =
  | "code_generation"
  | "architecture_design"
  | "ui_design"
  | "ui_fix"
  | "review_existing_project"
  | "debugging"
  | "refactor"
  | "documentation"
  | "automation_agent"
  | "business_content";

export type DomainType =
  | "general"
  | "python"
  | "django"
  | "react"
  | "pyqt"
  | "api"
  | "trading"
  | "web_app"
  | "frontend"
  | "desktop_app";

export type PromptStrategy =
  | "default"
  | "implement_new"
  | "inspect_and_adapt"
  | "ui_fix_existing"
  | "migrate_existing_system";

export type GenerationProfile =
  | "generic"
  | "modern_modular_landing"
  | "existing_frontend_audit"
  | "existing_system_migration";

export type AmbiguityLevel = "low" | "medium" | "high";
export type ClassificationConfidence = "low" | "medium" | "high";
export type PromptVariantKind = "master" | "implementation" | "concise";
export type DetailLevel = "low" | "medium" | "high";
export type OutputStyle = "balanced" | "step_by_step" | "technical" | "concise";
export type FeedbackValue = "useful" | "mixed" | "bad";

export interface UserPreferences {
  detailLevel: DetailLevel;
  outputStyle: OutputStyle;
  includeFileStructure: boolean;
  includeAssumptions: boolean;
}

export interface PromptPreset {
  id: string;
  label: string;
  description: string;
  messageTemplate: string;
  recommendedIntent?: IntentType;
  recommendedDomain?: DomainType;
  isExample?: boolean;
}

export interface PromptRequest {
  message: string;
  contextMessages?: string[];
  sessionId?: string;
  presetId?: string | null;
  preferences?: Partial<UserPreferences>;
}

export interface ClarificationQuestion {
  id: string;
  label: string;
  reason: string;
}

export interface GeneratedPrompt {
  id: string;
  label: string;
  kind: PromptVariantKind;
  content: string;
}

export interface RequestSynthesis {
  summary: string;
  primaryGoal: string;
  workMode: string;
  evidenceMode: string;
  requestedActions: string[];
  requestedDeliverables: string[];
  preferredStack: string[];
  constraints: string[];
  qualityTargets: string[];
}

export interface PromptResult {
  requestId: string;
  createdAt: string;
  inputOriginal: string;
  normalizedInput: string;
  intent: IntentType;
  domain: DomainType;
  strategy: PromptStrategy;
  generationProfile: GenerationProfile;
  projectReferences: string[];
  classificationConfidence: ClassificationConfidence;
  matchedSignals: string[];
  ambiguityLevel: AmbiguityLevel;
  needsClarification: boolean;
  clarificationQuestions: ClarificationQuestion[];
  assumptions: string[];
  synthesis: RequestSynthesis;
  generatedPrompts: GeneratedPrompt[];
  suggestedNextInputs: string[];
  warnings: string[];
  presetId?: string | null;
  preferencesApplied: UserPreferences;
}

export interface ClassificationResult {
  intent: IntentType;
  domain: DomainType;
  normalizedInput: string;
  keywords: string[];
  confidence: ClassificationConfidence;
  matchedSignals: string[];
  projectReferences: string[];
}

export interface ClarificationAnalysis {
  ambiguityLevel: AmbiguityLevel;
  needsClarification: boolean;
  questions: ClarificationQuestion[];
  assumptions: string[];
  suggestedNextInputs: string[];
}

export interface BuildPromptContext {
  originalInput: string;
  normalizedInput: string;
  intent: IntentType;
  domain: DomainType;
  strategy: PromptStrategy;
  generationProfile: GenerationProfile;
  projectReferences: string[];
  assumptions: string[];
  synthesis: RequestSynthesis;
  keywords: string[];
  matchedSignals: string[];
  classificationConfidence: ClassificationConfidence;
  preferences: UserPreferences;
  preset?: PromptPreset | null;
}

export interface PromptFeedbackEntry {
  requestId: string;
  value: FeedbackValue;
  createdAt: string;
}

export interface PromptEnhancerProvider {
  id: string;
  label: string;
  mode: "local" | "cloud";
  purpose: "rewrite" | "expand" | "router" | "fallback";
  enabledByDefault: boolean;
}
