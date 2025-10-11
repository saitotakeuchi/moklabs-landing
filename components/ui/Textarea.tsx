import { forwardRef } from "react";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  {
    label?: string;
    error?: string;
    className?: string;
    rows?: number;
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ label, error, className = "", rows = 4, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 resize-none
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
