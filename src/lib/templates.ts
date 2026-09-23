import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type AgentTemplate = {
  id: string;
  name: string;
  tagline: string;
  icon: IconName;
  color: string;
  /** The job description sent to the model as the agent's role. */
  role: string;
  inputLabel: string;
  inputPlaceholder: string;
  /** Rough minutes a person would spend doing this by hand, used for the "time saved" stat. */
  minutesSaved: number;
};

export const TEMPLATES: AgentTemplate[] = [
  {
    id: 'reviews',
    name: 'Review Responder',
    tagline: 'Replies to Google & Facebook reviews in your voice',
    icon: 'star',
    color: '#F59E0B',
    role:
      'You reply to customer reviews on Google, Facebook and Trustpilot. Thank happy customers warmly and specifically. For negative reviews, acknowledge the issue without admitting legal liability, apologise sincerely, and invite them to continue the conversation privately. Keep replies under 90 words.',
    inputLabel: 'Paste the review',
    inputPlaceholder: '★★☆☆☆ "Waited 40 minutes past our booking time and nobody told us why…"',
    minutesSaved: 8,
  },
  {
    id: 'inbox',
    name: 'Customer Inbox',
    tagline: 'Drafts replies to emails, DMs and enquiries',
    icon: 'mail',
    color: '#3B82F6',
    role:
      'You draft replies to customer emails and direct messages. Answer the question directly, be helpful and concise, and move the conversation toward a booking or sale where natural. Never invent prices, availability or policies that are not in the business profile; instead, insert a clear [placeholder] for the owner to fill in.',
    inputLabel: 'Paste the customer message',
    inputPlaceholder: 'Hi, do you do weekend appointments and how much is a full service?',
    minutesSaved: 10,
  },
  {
    id: 'social',
    name: 'Social Media Manager',
    tagline: 'Writes posts for Instagram, Facebook & LinkedIn',
    icon: 'megaphone',
    color: '#EC4899',
    role:
      'You write social media posts for a small business. Produce one version each for Instagram (with 5-8 relevant hashtags), Facebook, and LinkedIn, each clearly labelled. Lead with a hook, keep it authentic rather than salesy, and end with a clear call to action.',
    inputLabel: 'What should the post be about?',
    inputPlaceholder: 'We just finished a kitchen refit in Chelmsford — before/after photos, 3 week job',
    minutesSaved: 20,
  },
  {
    id: 'invoices',
    name: 'Invoice Chaser',
    tagline: 'Polite, firm payment reminders that get paid',
    icon: 'cash',
    color: '#10B981',
    role:
      'You write payment reminder messages for overdue invoices. Match firmness to how overdue the invoice is: friendly nudge under 14 days, firm but courteous at 14-30 days, and a formal final reminder mentioning next steps after 30 days. Always include the amount, invoice reference and how to pay if provided.',
    inputLabel: 'Invoice details',
    inputPlaceholder: 'Client: Smith & Co, invoice #1042, £850, 21 days overdue, pay by bank transfer',
    minutesSaved: 7,
  },
  {
    id: 'leads',
    name: 'Lead Qualifier',
    tagline: 'Scores new enquiries and drafts the first reply',
    icon: 'funnel',
    color: '#8B5CF6',
    role:
      'You qualify inbound sales leads. First give a lead score (Hot / Warm / Cold) with a one-line justification based on budget, urgency, fit and authority signals. Then list the questions still needing answers. Then draft a reply that answers what you can and asks the most important qualifying questions.',
    inputLabel: 'Paste the enquiry',
    inputPlaceholder: 'Looking for someone to redo our website before our March launch, budget flexible',
    minutesSaved: 15,
  },
  {
    id: 'quotes',
    name: 'Quote Builder',
    tagline: 'Turns rough job notes into a professional quote',
    icon: 'document-text',
    color: '#0EA5E9',
    role:
      'You turn rough job notes into a clear, professional quote or estimate the owner can send to a customer. Include a short summary of the work, an itemised breakdown, what is and is not included, assumptions, timeline and validity period. Use [placeholders] for any prices not given — never invent prices.',
    inputLabel: 'Job notes',
    inputPlaceholder: 'Replace 6 fence panels + 2 posts, rear garden, customer wants it done before Easter',
    minutesSaved: 25,
  },
  {
    id: 'local-seo',
    name: 'Local SEO Writer',
    tagline: 'Google Business Profile posts & service pages',
    icon: 'location',
    color: '#EF4444',
    role:
      'You write content that helps a local business rank in local search: Google Business Profile updates, service area pages and FAQ answers. Naturally include the business location and services, write for humans first, and suggest a short SEO title and meta description when writing page content.',
    inputLabel: 'What do you need?',
    inputPlaceholder: 'A Google Business post about our new Saturday opening hours',
    minutesSaved: 20,
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    tagline: 'Describe any repeatable task and it will handle it',
    icon: 'sparkles',
    color: '#6366F1',
    role: 'You are a capable assistant for a small business. Follow the owner’s instructions for this agent precisely.',
    inputLabel: 'Task',
    inputPlaceholder: 'What should the agent do?',
    minutesSaved: 10,
  },
];

export function getTemplate(id: string): AgentTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[TEMPLATES.length - 1];
}
