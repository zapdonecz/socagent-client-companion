import { Client, PersonalProfile, PersonalPlan, CalendarEvent, SemiAnnualReview } from '@/types';

const STORAGE_KEYS = {
  CLIENTS: 'socagent_clients',
  PROFILES: 'socagent_profiles',
  PLANS: 'socagent_plans',
  EVENTS: 'socagent_events',
  REVIEWS: 'socagent_reviews',
} as const;

// Generic storage helpers
const getItems = <T>(key: string): T[] => {
  const json = localStorage.getItem(key);
  return json ? JSON.parse(json) : [];
};

const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

// Clients
export const getClients = (): Client[] => getItems<Client>(STORAGE_KEYS.CLIENTS);

export const saveClient = (client: Client) => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id);
  if (index >= 0) {
    clients[index] = { ...client, updatedAt: new Date().toISOString() };
  } else {
    clients.push({ ...client, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setItems(STORAGE_KEYS.CLIENTS, clients);
};

export const deleteClient = (id: string) => {
  const clients = getClients().filter(c => c.id !== id);
  setItems(STORAGE_KEYS.CLIENTS, clients);
};

// Personal Profiles
export const getProfiles = (): PersonalProfile[] => getItems<PersonalProfile>(STORAGE_KEYS.PROFILES);

export const getProfileByClientId = (clientId: string): PersonalProfile | null => {
  return getProfiles().find(p => p.clientId === clientId) || null;
};

export const saveProfile = (profile: PersonalProfile) => {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === profile.id);
  if (index >= 0) {
    profiles[index] = { ...profile, updatedAt: new Date().toISOString() };
  } else {
    profiles.push({ ...profile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setItems(STORAGE_KEYS.PROFILES, profiles);
};

// Personal Plans
export const getPlans = (): PersonalPlan[] => getItems<PersonalPlan>(STORAGE_KEYS.PLANS);

export const getPlansByClientId = (clientId: string): PersonalPlan[] => {
  return getPlans().filter(p => p.clientId === clientId);
};

export const savePlan = (plan: PersonalPlan) => {
  const plans = getPlans();
  const index = plans.findIndex(p => p.id === plan.id);
  if (index >= 0) {
    plans[index] = { ...plan, updatedAt: new Date().toISOString() };
  } else {
    plans.push({ ...plan, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setItems(STORAGE_KEYS.PLANS, plans);
};

export const deletePlan = (id: string) => {
  const plans = getPlans().filter(p => p.id !== id);
  setItems(STORAGE_KEYS.PLANS, plans);
};

// Calendar Events
export const getEvents = (): CalendarEvent[] => getItems<CalendarEvent>(STORAGE_KEYS.EVENTS);

export const saveEvent = (event: CalendarEvent) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === event.id);
  if (index >= 0) {
    events[index] = event;
  } else {
    events.push(event);
  }
  setItems(STORAGE_KEYS.EVENTS, events);
};

export const deleteEvent = (id: string) => {
  const events = getEvents().filter(e => e.id !== id);
  setItems(STORAGE_KEYS.EVENTS, events);
};

// Semi-annual Reviews
export const getReviews = (): SemiAnnualReview[] => getItems<SemiAnnualReview>(STORAGE_KEYS.REVIEWS);

export const getReviewsByClientId = (clientId: string): SemiAnnualReview[] => {
  return getReviews().filter(r => r.clientId === clientId);
};

export const saveReview = (review: SemiAnnualReview) => {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.id === review.id);
  if (index >= 0) {
    reviews[index] = review;
  } else {
    reviews.push({ ...review, createdAt: new Date().toISOString() });
  }
  setItems(STORAGE_KEYS.REVIEWS, reviews);
};
