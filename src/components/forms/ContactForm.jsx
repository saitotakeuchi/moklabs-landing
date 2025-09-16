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
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
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
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Mensagem enviada!
        </h3>
        <p className="text-gray-600 mb-6">
          Obrigado pelo contato. Responderemos em breve!
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
        >
          Enviar nova mensagem
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        type="text"
        label="Nome"
        placeholder="Seu nome completo"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="E-mail"
        placeholder="seu@email.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <Textarea
        id="message"
        name="message"
        label="Mensagem"
        placeholder="Conte-nos sobre seu projeto, prazos e necessidades..."
        rows={6}
        value={formData.message}
        onChange={handleChange}
        error={errors.message}
        required
      />

      {errors.submit && (
        <div className="text-red-600 text-sm text-center">
          {errors.submit}
        </div>
      )}

      <div className="flex justify-center">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;