/**
 * useEditais Hook
 *
 * Manages edital (notice) state and operations
 */

import { useState, useEffect, useCallback } from "react";
import type {
  Edital,
  CreateEditalRequest,
  UpdateEditalRequest,
} from "@moklabs/pnld-types";
import { getUserFriendlyErrorMessage } from "@/lib/error-handler";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PNLD_AI_SERVICE_URL || "http://localhost:8000";

interface UseEditaisReturn {
  editais: Edital[];
  isLoading: boolean;
  error: string | null;
  fetchEditais: () => Promise<void>;
  createEdital: (data: CreateEditalRequest) => Promise<Edital>;
  updateEdital: (id: string, data: UpdateEditalRequest) => Promise<Edital>;
  deleteEdital: (id: string) => Promise<void>;
}

export function useEditais(): UseEditaisReturn {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEditais = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/editais?limit=100`);

      if (!response.ok) {
        throw new Error(`Failed to fetch editais: ${response.statusText}`);
      }

      const data = await response.json();
      setEditais(data.editais || []);
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err as Error);
      setError(errorMessage);
      console.error("Error fetching editais:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEdital = useCallback(
    async (data: CreateEditalRequest): Promise<Edital> => {
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/editais`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
              `Failed to create edital: ${response.statusText}`
          );
        }

        const edital = await response.json();

        // Add to local state
        setEditais((prev) => [edital, ...prev]);

        return edital;
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err as Error);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const updateEdital = useCallback(
    async (id: string, data: UpdateEditalRequest): Promise<Edital> => {
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/editais/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
              `Failed to update edital: ${response.statusText}`
          );
        }

        const updatedEdital = await response.json();

        // Update local state
        setEditais((prev) =>
          prev.map((edital) => (edital.id === id ? updatedEdital : edital))
        );

        return updatedEdital;
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err as Error);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteEdital = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/editais/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Failed to delete edital: ${response.statusText}`
        );
      }

      // Remove from local state
      setEditais((prev) => prev.filter((edital) => edital.id !== id));
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err as Error);
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Fetch editais on mount
  useEffect(() => {
    fetchEditais();
  }, [fetchEditais]);

  return {
    editais,
    isLoading,
    error,
    fetchEditais,
    createEdital,
    updateEdital,
    deleteEdital,
  };
}
