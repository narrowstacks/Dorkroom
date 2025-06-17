/**
 * TypeScript interfaces for Dorkroom API data structures.
 * 
 * These interfaces represent the data structures returned by the
 * Dorkroom Static API for film stocks, developers, and development combinations.
 */

/**
 * Represents a film stock with all its properties.
 */
export interface Film {
  /** Unique identifier for the film */
  id: string;
  /** Display name of the film */
  name: string;
  /** Manufacturer/brand name */
  brand: string;
  /** ISO speed rating */
  iso_speed: number;
  /** Type of film (color, b&w, etc.) */
  color_type: string;
  /** Optional detailed description */
  description?: string;
  /** Whether film is discontinued (0=no, 1=yes) */
  discontinued: number;
  /** List of notes from manufacturer */
  manufacturer_notes: string[];
  /** Description of grain characteristics */
  grain_structure?: string;
  /** Information about reciprocity failure */
  reciprocity_failure?: string;
}

/**
 * Represents a dilution ratio for a developer.
 */
export interface Dilution {
  id: number;
  ratio: string;
  description?: string;
  [key: string]: any;
}

/**
 * Represents a film/paper developer with all its properties.
 */
export interface Developer {
  /** Unique identifier for the developer */
  id: string;
  /** Display name of the developer */
  name: string;
  /** Manufacturer/brand name */
  manufacturer: string;
  /** Type of developer (e.g., "Black & White Film") */
  type: string;
  /** Whether for film or paper development */
  film_or_paper: string;
  /** List of available dilution ratios */
  dilutions: Dilution[];
  /** Working solution lifetime in hours */
  working_life_hours?: number;
  /** Stock solution lifetime in months */
  stock_life_months?: number;
  /** Additional notes about the developer */
  notes?: string;
  /** Whether developer is discontinued (0=no, 1=yes) */
  discontinued: number;
  /** How to prepare the developer */
  mixing_instructions?: string;
  /** Safety information and warnings */
  safety_notes?: string;
  /** URLs to manufacturer datasheets */
  datasheet_url?: string[];
}

/**
 * Represents a film+developer combination with development parameters.
 */
export interface Combination {
  /** Unique identifier for the combination */
  id: string;
  /** Display name describing the combination */
  name: string;
  /** ID of the film used */
  film_stock_id: string;
  /** ID of the developer used */
  developer_id: string;
  /** Development temperature in Fahrenheit */
  temperature_f: number;
  /** Development time in minutes */
  time_minutes: number;
  /** ISO at which the film was shot */
  shooting_iso: number;
  /** Push/pull processing offset (0=normal, +1=push 1 stop, etc.) */
  push_pull: number;
  /** Description of agitation pattern */
  agitation_schedule?: string;
  /** Additional development notes */
  notes?: string;
  /** ID of specific dilution used */
  dilution_id?: number;
  /** Custom dilution ratio if not standard */
  custom_dilution?: string;
}

/**
 * Configuration options for the DorkroomClient.
 */
export interface DorkroomClientConfig {
  /** Base URL for the API endpoints */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Custom logger instance */
  logger?: Logger;
}

/**
 * Simple logger interface for dependency injection.
 */
export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/**
 * Options for fuzzy search operations.
 */
export interface FuzzySearchOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum similarity score (0-1) to include in results */
  threshold?: number;
} 