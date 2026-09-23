import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getTemplate } from './templates';

export type Tone = 'friendly' | 'professional' | 'playful' | 'formal';

export type BusinessProfile = {
  name: string;
  industry: string;
  location: string;
  description: string;
  tone: Tone;
  signOff: string;
};

export type Agent = {
  id: string;
  templateId: string;
  name: string;
  /** Extra owner-written rules layered on top of the template role. */
  instructions: string;
  enabled: boolean;
  /** When true, output waits in the Inbox for approval instead of being marked done. */
  requireApproval: boolean;
  createdAt: number;
};

export type RunStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';

export type Run = {
  id: string;
  agentId: string;
  input: string;
  status: RunStatus;
  title: string;
  summary: string;
  output: string;
  nextStep: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
};

type State = {
  /** Anonymous per-install ID, used when RevenueCat isn't configured. */
  deviceId: string;
  business: BusinessProfile;
  aiConsentAt: number | null;
  agents: Agent[];
  runs: Run[];
  /** Mirrors the server's count; the server is the source of truth for limits. */
  usage: { month: string; used: number; limit: number };

  saveBusiness: (b: BusinessProfile) => void;
  giveConsent: () => void;
  addAgent: (templateId: string, name?: string) => Agent;
  updateAgent: (id: string, patch: Partial<Omit<Agent, 'id'>>) => void;
  deleteAgent: (id: string) => void;
  addRun: (run: Run) => void;
  updateRun: (id: string, patch: Partial<Omit<Run, 'id'>>) => void;
  setUsage: (used: number, limit: number) => void;
  resetAll: () => void;
};

export const EMPTY_BUSINESS: BusinessProfile = {
  name: '',
  industry: '',
  location: '',
  description: '',
  tone: 'friendly',
  signOff: '',
};

export const currentMonth = () => new Date().toISOString().slice(0, 7);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const initial = {
  deviceId: uid(),
  business: EMPTY_BUSINESS,
  aiConsentAt: null,
  agents: [] as Agent[],
  runs: [] as Run[],
  usage: { month: currentMonth(), used: 0, limit: 20 },
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      saveBusiness: (business) => set({ business }),
      giveConsent: () => set({ aiConsentAt: Date.now() }),

      addAgent: (templateId, name) => {
        const agent: Agent = {
          id: uid(),
          templateId,
          name: name?.trim() || getTemplate(templateId).name,
          instructions: '',
          enabled: true,
          requireApproval: true,
          createdAt: Date.now(),
        };
        set((s) => ({ agents: [...s.agents, agent] }));
        return agent;
      },
      updateAgent: (id, patch) =>
        set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      deleteAgent: (id) =>
        set((s) => ({
          agents: s.agents.filter((a) => a.id !== id),
          runs: s.runs.filter((r) => r.agentId !== id),
        })),

      // Newest first; keep local history bounded.
      addRun: (run) => set((s) => ({ runs: [run, ...s.runs].slice(0, 500) })),
      updateRun: (id, patch) =>
        set((s) => ({
          runs: s.runs.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r)),
        })),

      setUsage: (used, limit) => set({ usage: { month: currentMonth(), used, limit } }),
      resetAll: () => set({ ...initial, deviceId: get().deviceId }),
    }),
    {
      name: 'agentdeck-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export { uid };

export function isOnboarded(s: Pick<State, 'business' | 'aiConsentAt'>) {
  return s.business.name.trim() !== '' && s.aiConsentAt !== null;
}
