export type ErrorType = 
  | "RATE_LIMIT_IP" 
  | "RATE_LIMIT_URL" 
  | "SITE_UNREACHABLE" 
  | "BOT_BLOCKED" 
  | "TIMEOUT" 
  | "API_QUOTA" 
  | "GENERAL_ERROR";

export interface ErrorResponse {
  error_type: ErrorType;
  error_code: string;
  user_message: string;
  next_available_time?: string;
  suggested_action: string;
  technical_details?: string;
  cached_test_id?: string;
  cached_score?: number;
  cached_created_at?: string;
}

export function isStructuredError(data: unknown): data is ErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error_type" in data &&
    "user_message" in data
  );
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(isoDate));
}

export function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoDate));
}
