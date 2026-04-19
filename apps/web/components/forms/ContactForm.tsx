"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import posthog from "posthog-js";
import {
  flattenAttribution,
  getAttribution,
  type Attribution,
} from "@/lib/attribution";

const safeCapture = (
  event: string,
  properties?: Record<string, unknown>
): void => {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
};

const SERVICE_OPTIONS = [
  "Conversão EPUB3",
  "Recursos Digitais",
  "Simuladores",
  "Objetos Digitais",
  "Livro Digital",
  "PNLD Digital",
  "Audiodescrição",
  "Ilustração",
  "Outros",
] as const;

interface FormData {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  service?: string;
  message?: string;
  submit?: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  company: "",
  service: "",
  message: "",
};

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Defer one tick so the PostHogProvider's init effect runs first.
    const timer = setTimeout(() => {
      safeCapture("lead_form_viewed");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.service) {
      newErrors.service = "Selecione um serviço";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mensagem é obrigatória";
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      console.warn("[contact-form] validation failed", validationErrors);
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Abort hung requests so the button never gets stuck on "Enviando..."
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const startedAt = Date.now();

    const attribution: Attribution = getAttribution();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: formData.company.trim(),
      service: formData.service,
      message: formData.message.trim(),
      attribution,
    };

    // console.warn survives Next's production build; console.info is stripped.
    console.warn("[contact-form] submit dispatched", {
      apiUrl: "/api/contact",
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const durationMs = Date.now() - startedAt;

      if (response.ok) {
        console.info(
          `[contact-form] Submitted successfully in ${durationMs}ms`
        );

        if (posthog.__loaded) {
          posthog.identify(payload.email, {
            name: payload.name,
            company: payload.company || undefined,
            service: payload.service,
          });
        }
        safeCapture("lead_submitted", {
          service: payload.service,
          company: payload.company || undefined,
          duration_ms: durationMs,
          ...flattenAttribution(attribution),
        });

        setIsSubmitted(true);
        setFormData(EMPTY_FORM);
        return;
      }

      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      console.error(
        `[contact-form] Server returned ${response.status} in ${durationMs}ms`,
        errorData
      );
      setErrors({
        submit:
          errorData.error ||
          `Erro ao enviar mensagem (HTTP ${response.status}). Tente novamente.`,
      });
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      console.error(
        `[contact-form] Request failed after ${durationMs}ms:`,
        error
      );

      let message = "Erro ao enviar mensagem. Tente novamente.";
      if (error instanceof DOMException && error.name === "AbortError") {
        message =
          "Tempo limite excedido. Verifique sua conexão e tente novamente.";
      } else if (error instanceof TypeError) {
        message = "Falha de conexão. Verifique sua internet e tente novamente.";
      } else if (error instanceof Error) {
        message = error.message;
      }

      setErrors({ submit: message });
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        className="text-center py-12 text-[#0013ff]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[#0013ff]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">Mensagem enviada!</h3>
        <p className="mb-6">Obrigado pelo contato. Responderemos em breve!</p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="bg-[#0013ff] text-white px-6 py-2 rounded-3xl text-base font-bold hover:bg-blue-800 transition-colors"
        >
          Enviar nova mensagem
        </button>
      </motion.div>
    );
  }

  const fieldError = (error?: string) =>
    error ? <p className="text-red-600 text-xs mt-1">{error}</p> : null;

  const inputBase =
    "peer bg-white w-full h-[56px] px-2.5 pt-5 pb-1.5 text-xs text-[#575756] border-0 outline-none";
  const ring = (error?: string) => (error ? "ring-1 ring-red-600" : "");

  // Floating-label class for input/textarea (uses peer-placeholder-shown trick).
  // Requires placeholder=" " on the paired field.
  const floatingLabel =
    "absolute left-2.5 top-1.5 text-[10px] font-medium text-[#0013ff] transition-all pointer-events-none " +
    "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#9a9a99] peer-placeholder-shown:font-normal " +
    "peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#0013ff] peer-focus:font-medium";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-8 items-center"
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col">
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              placeholder=" "
              value={formData.name}
              onChange={handleChange}
              className={`${inputBase} ${ring(errors.name)}`}
            />
            <label htmlFor="name" className={floatingLabel}>
              Nome completo
            </label>
          </div>
          {fieldError(errors.name)}
        </div>

        <div className="flex flex-col">
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              className={`${inputBase} ${ring(errors.email)}`}
            />
            <label htmlFor="email" className={floatingLabel}>
              E-mail
            </label>
          </div>
          {fieldError(errors.email)}
        </div>

        <div className="flex flex-col">
          <div className="relative">
            <input
              id="company"
              name="company"
              type="text"
              placeholder=" "
              value={formData.company}
              onChange={handleChange}
              className={`${inputBase} ${ring(errors.company)}`}
            />
            <label htmlFor="company" className={floatingLabel}>
              Empresa/Editora (opcional)
            </label>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="relative">
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className={`bg-white w-full h-[56px] px-2.5 pt-5 pb-1.5 text-xs border-0 outline-none appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2020%2020%22%20fill=%22%23575756%22><path%20d=%22M5.5%208l4.5%204.5L14.5%208z%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center] pr-8 ${
                formData.service ? "text-[#575756]" : "text-transparent"
              } ${ring(errors.service)}`}
            >
              <option value="" disabled>
                {/* Prompt hidden visually — label above replaces it. */}
              </option>
              {SERVICE_OPTIONS.map((option) => (
                <option key={option} value={option} className="text-[#575756]">
                  {option}
                </option>
              ))}
            </select>
            <label
              htmlFor="service"
              className="absolute left-2.5 top-1.5 text-[10px] font-medium text-[#0013ff] pointer-events-none"
            >
              Serviço de interesse
            </label>
          </div>
          {fieldError(errors.service)}
        </div>

        <div className="flex flex-col">
          <div className="relative">
            <textarea
              id="message"
              name="message"
              placeholder=" "
              rows={8}
              value={formData.message}
              onChange={handleChange}
              className={`peer bg-white w-full h-[200px] px-2.5 pt-5 pb-1.5 text-xs text-[#575756] border-0 outline-none resize-none ${ring(
                errors.message
              )}`}
            />
            <label
              htmlFor="message"
              className="absolute left-2.5 top-1.5 text-[10px] font-medium text-[#0013ff] transition-all pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#9a9a99] peer-placeholder-shown:font-normal peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#0013ff] peer-focus:font-medium"
            >
              Mensagem
            </label>
          </div>
          {fieldError(errors.message)}
        </div>
      </div>

      {errors.submit && (
        <div className="text-red-600 text-sm text-center">{errors.submit}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        onClick={() =>
          safeCapture("lead_form_submit_clicked", {
            service: formData.service || undefined,
          })
        }
        className="bg-[#0013ff] text-white px-6 py-2 rounded-3xl text-base font-bold hover:bg-blue-800 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};

export default ContactForm;
