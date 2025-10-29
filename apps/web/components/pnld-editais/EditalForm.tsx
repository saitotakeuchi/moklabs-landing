"use client";

import { useState, FormEvent } from "react";
import type { Edital, EditalType, CreateEditalRequest } from "@moklabs/pnld-types";

interface EditalFormProps {
  edital?: Edital | null;
  onSubmit: (data: CreateEditalRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EDITAL_TYPES: Array<{ value: EditalType; label: string }> = [
  { value: "didático", label: "Didático" },
  { value: "literário", label: "Literário" },
  { value: "outros", label: "Outros" },
];

export function EditalForm({
  edital,
  onSubmit,
  onCancel,
  isLoading = false,
}: EditalFormProps) {
  const [name, setName] = useState(edital?.name || "");
  const [year, setYear] = useState(edital?.year?.toString() || "");
  const [type, setType] = useState<EditalType>(edital?.type || "didático");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (name.length > 40) {
      newErrors.name = "Nome deve ter no máximo 40 caracteres";
    }

    // Validate year
    const yearNum = parseInt(year);
    if (!year) {
      newErrors.year = "Ano é obrigatório";
    } else if (isNaN(yearNum)) {
      newErrors.year = "Ano deve ser um número";
    } else if (yearNum < 2000 || yearNum > 2100) {
      newErrors.year = "Ano deve estar entre 2000 e 2100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: CreateEditalRequest = {
      name: name.trim(),
      year: parseInt(year),
      type,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label
          htmlFor="edital-name"
          className="block font-sans text-sm font-medium text-[#0013ff] mb-2"
        >
          Nome do Edital
        </label>
        <input
          id="edital-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          disabled={isLoading}
          className={`w-full bg-white border-2 ${
            errors.name ? "border-red-500" : "border-[#0013ff]"
          } rounded-[16px]
                     px-4 py-3
                     font-inter text-sm text-[#0013ff]
                     placeholder:text-[#0013ff] placeholder:opacity-50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[#0013ff] focus:ring-offset-2
                     min-h-[44px]`}
          placeholder="Ex: PNLD 2024 Anos Iniciais"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600 font-sans">
            {errors.name}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-600 font-sans">
          {name.length}/40 caracteres
        </p>
      </div>

      {/* Year Field */}
      <div>
        <label
          htmlFor="edital-year"
          className="block font-sans text-sm font-medium text-[#0013ff] mb-2"
        >
          Ano
        </label>
        <input
          id="edital-year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={2000}
          max={2100}
          disabled={isLoading}
          className={`w-full bg-white border-2 ${
            errors.year ? "border-red-500" : "border-[#0013ff]"
          } rounded-[16px]
                     px-4 py-3
                     font-inter text-sm text-[#0013ff]
                     placeholder:text-[#0013ff] placeholder:opacity-50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[#0013ff] focus:ring-offset-2
                     min-h-[44px]`}
          placeholder="2024"
          aria-invalid={!!errors.year}
          aria-describedby={errors.year ? "year-error" : undefined}
        />
        {errors.year && (
          <p id="year-error" className="mt-1 text-sm text-red-600 font-sans">
            {errors.year}
          </p>
        )}
      </div>

      {/* Type Field */}
      <div>
        <label
          htmlFor="edital-type"
          className="block font-sans text-sm font-medium text-[#0013ff] mb-2"
        >
          Tipo
        </label>
        <select
          id="edital-type"
          value={type}
          onChange={(e) => setType(e.target.value as EditalType)}
          disabled={isLoading}
          className="w-full bg-white border-2 border-[#0013ff] rounded-[16px]
                     px-4 py-3
                     font-inter text-sm text-[#0013ff]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[#0013ff] focus:ring-offset-2
                     min-h-[44px]
                     cursor-pointer"
        >
          {EDITAL_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-3 min-h-[44px]
                     bg-white border-2 border-[#0013ff]
                     rounded-[16px]
                     font-sans font-bold text-sm text-[#0013ff]
                     hover:bg-gray-50 active:bg-gray-100
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 min-h-[44px]
                     bg-[#ccff73]
                     rounded-[16px]
                     font-sans font-bold text-sm text-[#0013ff]
                     hover:bg-[#b8e860] active:bg-[#a4d54d]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          {isLoading ? "Salvando..." : edital ? "Salvar" : "Criar Edital"}
        </button>
      </div>
    </form>
  );
}
