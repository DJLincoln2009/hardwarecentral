import { z } from 'zod';

export const emailField = z.string().email('Adresse e-mail professionnelle invalide');

export const quoteRequestSchema = z.object({
  fullName: z.string().min(2, 'Nom complet requis'),
  companyName: z.string().optional(),
  professionalEmail: emailField,
  phone: z.string().optional(),
  message: z.string().min(10, 'Message trop court (minimum 10 caractères)'),
  productIds: z.array(z.string()).min(1, 'Au moins un produit requis dans la demande'),
  honeypot: z.string().max(0, '').optional(),
});

export const contactMessageSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  companyName: z.string().optional(),
  professionalEmail: emailField,
  subject: z.enum(['devis', 'support-technique', 'partenariat', 'autre'], {
    errorMap: () => ({ message: 'Sujet requis' }),
  }),
  message: z.string().min(10, 'Message trop court (minimum 10 caractères)'),
  honeypot: z.string().max(0, '').optional(),
});

export const newsletterSchema = z.object({
  email: emailField,
  honeypot: z.string().max(0, '').optional(),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
