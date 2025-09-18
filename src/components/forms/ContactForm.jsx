import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input, Textarea, Button } from '../ui';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mensagem deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // API endpoint - works for both development and production
      const apiUrl = import.meta.env.DEV ? 'http://localhost:3001/api/contact' : '/api/contact';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        submit: 'Erro ao enviar mensagem. Tente novamente.'
      });
    } finally {
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
        <h3 className="text-2xl font-bold mb-2">
          Mensagem enviada!
        </h3>
        <p className="mb-6">
          Obrigado pelo contato. Responderemos em breve!
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="bg-[#0013ff] text-white px-6 py-2 rounded-3xl text-base font-bold hover:bg-blue-800 transition-colors"
        >
          Enviar nova mensagem
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 items-center">
      <div className="flex flex-col gap-4 w-full">
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Nome"
          value={formData.name}
          onChange={handleChange}
          className="bg-white p-2.5 h-[42px] text-xs text-[#575756] border-0 outline-none"
          required
        />

        <input
          id="email"
          name="email"
          type="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          className="bg-white p-2.5 h-[42px] text-xs text-[#575756] border-0 outline-none"
          required
        />

        <textarea
          id="message"
          name="message"
          placeholder="Mensagem"
          rows={8}
          value={formData.message}
          onChange={handleChange}
          className="bg-white p-2.5 h-[200px] text-xs text-[#575756] border-0 outline-none resize-none"
          required
        />
      </div>

      {errors.submit && (
        <div className="text-red-600 text-sm text-center">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#0013ff] text-white px-6 py-2 rounded-3xl text-base font-bold hover:bg-blue-800 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
};

export default ContactForm;