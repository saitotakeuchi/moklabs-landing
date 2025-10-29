/**
 * Edital (Notice/Announcement) Types
 *
 * Defines the data structure for PNLD editais (public notices)
 */

/**
 * Type of edital
 */
export type EditalType = "didático" | "literário" | "outros";

/**
 * Edital entity
 */
export interface Edital {
  /** Unique identifier (slug generated from name) */
  id: string;
  /** Edital name (max 40 characters) */
  name: string;
  /** Year in YYYY format */
  year: number;
  /** Type of edital */
  type: EditalType;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Request payload for creating an edital
 */
export interface CreateEditalRequest {
  /** Edital name (max 40 characters) */
  name: string;
  /** Year in YYYY format */
  year: number;
  /** Type of edital */
  type: EditalType;
}

/**
 * Request payload for updating an edital
 */
export interface UpdateEditalRequest {
  /** Edital name (max 40 characters) */
  name?: string;
  /** Year in YYYY format */
  year?: number;
  /** Type of edital */
  type?: EditalType;
}

/**
 * Response from edital list endpoint
 */
export interface ListEditaisResponse {
  editais: Edital[];
  total: number;
}

/**
 * Edital validation errors
 */
export interface EditalValidationError {
  field: "name" | "year" | "type";
  message: string;
}
