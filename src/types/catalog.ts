export type Family =
  | "pressure"
  | "extraction"
  | "vacuum"
  | "steam"
  | "floor"
  | "sweep"
  | "drain"
  | "pet";

export type ReviewState = "pending" | "approved" | "rejected";

export type CommercialState = "buyable" | "quote" | "unavailable" | "hidden" | "review";

export type EvidenceState = "pending" | "approved" | "rejected";

export interface Evidence<T> {
  value: T | null;
  source: {
    kind: "csv" | "manual" | "review";
    locator: string;
    field?: string;
  };
  state: EvidenceState;
  reviewedAt?: string;
}

export interface Variant {
  id: string;
  voltage: Evidence<"127" | "220" | "bivolt" | "other" | "none">;
  phase: Evidence<"single" | "three" | "none">;
  powerSource: Evidence<"mains" | "battery" | "gasoline" | "manual">;
  stock: number | null;
  priceCents: number | null;
  commercialState: CommercialState;
}

export interface Machine {
  id: string;
  reference: string;
  name: string;
  model: string;
  family: Family;
  subtype: string;
  isCompleteMachine: boolean;
  quizStatus: ReviewState;
  imageUrl: string;
  productUrl: string;
  descriptionText: string;
  contexts: Evidence<string[]>;
  applications: Evidence<string[]>;
  limitations: Evidence<string[]>;
  dutyProfile: Evidence<string[]>;
  workloadBands: Evidence<string[]>;
  priorityTags: Evidence<string[]>;
  specifications: Record<string, Evidence<string | number | boolean>>;
  variants: Variant[];
  commercial: {
    regularPriceCents: number | null;
    promotion: {
      priceCents: number;
      startsOn: string;
      endsOn: string;
    } | null;
    state: CommercialState;
    stockSnapshot: number | null;
    enabled: boolean;
    visible: boolean;
    quoteApproved: boolean;
  };
  source: {
    fileName: string;
    productId: string;
    importedAt: string;
    hash: string;
  };
}

export interface QuizAnswers {
  goal: Family;
  context: "home" | "business" | "service" | "industrial";
  frequency: "occasional" | "weekly" | "daily" | "extended";
  surface: string;
  workload: string;
  power: string;
  priority: string;
  budget: number | "open";
  checks: Record<string, string>;
}

export interface RecommendationItem {
  productId: string;
  variantId: string | null;
  reasonCodes: string[];
  reasons: string[];
  caveats: string[];
  priceCents: number | null;
  commercialState: CommercialState;
}

export interface RecommendationResult {
  status: "direct" | "quote" | "needs-review" | "no-match";
  catalogVersion: string;
  rulesVersion: string;
  evaluatedAt: string;
  recommendations: RecommendationItem[];
  reviewReasons: string[];
}
