import { Client, ClientNote, ClientDocument, Meeting, AppSettings } from '@/types';
import { z } from 'zod';

const STORAGE_KEYS = {
  CLIENTS: 'socagent_clients',
  PROFILES: 'socagent_profiles',
  PLANS: 'socagent_plans',
  EVENTS: 'socagent_events',
  REVIEWS: 'socagent_reviews',
  NOTES: 'socagent_notes',
  DOCUMENTS: 'socagent_documents',
  MEETINGS: 'socagent_meetings',
  SETTINGS: 'socagent_settings',
} as const;

// Generic storage helpers
const getItems = <T>(key: string): T[] => {
  const json = localStorage.getItem(key);
  return json ? JSON.parse(json) : [];
};

const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

// Client Notes
export const getNotes = (): ClientNote[] => getItems<ClientNote>(STORAGE_KEYS.NOTES);

export const getNotesByClientId = (clientId: string): ClientNote[] => {
  return getNotes().filter(n => n.clientId === clientId);
};

export const saveNote = (note: ClientNote) => {
  const notes = getNotes();
  const index = notes.findIndex(n => n.id === note.id);
  if (index >= 0) {
    notes[index] = { ...note, updatedAt: new Date().toISOString() };
  } else {
    notes.push({ ...note, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setItems(STORAGE_KEYS.NOTES, notes);
};

export const deleteNote = (id: string) => {
  const notes = getNotes().filter(n => n.id !== id);
  setItems(STORAGE_KEYS.NOTES, notes);
};

// Client Documents
export const getDocuments = (): ClientDocument[] => getItems<ClientDocument>(STORAGE_KEYS.DOCUMENTS);

export const getDocumentsByClientId = (clientId: string): ClientDocument[] => {
  return getDocuments().filter(d => d.clientId === clientId);
};

export const saveDocument = (document: ClientDocument) => {
  const documents = getDocuments();
  documents.push(document);
  setItems(STORAGE_KEYS.DOCUMENTS, documents);
};

export const deleteDocument = (id: string) => {
  const documents = getDocuments().filter(d => d.id !== id);
  setItems(STORAGE_KEYS.DOCUMENTS, documents);
};

// Meetings
export const getMeetings = (): Meeting[] => getItems<Meeting>(STORAGE_KEYS.MEETINGS);

export const getMeetingsByClientId = (clientId: string): Meeting[] => {
  return getMeetings().filter(m => m.clientId === clientId);
};

export const saveMeeting = (meeting: Meeting) => {
  const meetings = getMeetings();
  const index = meetings.findIndex(m => m.id === meeting.id);
  if (index >= 0) {
    meetings[index] = { ...meeting, updatedAt: new Date().toISOString() };
  } else {
    meetings.push({ ...meeting, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setItems(STORAGE_KEYS.MEETINGS, meetings);
};

export const deleteMeeting = (id: string) => {
  const meetings = getMeetings().filter(m => m.id !== id);
  setItems(STORAGE_KEYS.MEETINGS, meetings);
};

// Settings
const defaultSettings: AppSettings = {
  deadlineWarningDays: 14,
  reviewReminderMonths: 5,
  profileUpdateMonths: 6,
  showCompletedPlans: false,
  stepDeadlineWarningDays: 14,
  eventReminderDays: 7,
};

export const getSettings = (): AppSettings => {
  const json = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return json ? JSON.parse(json) : defaultSettings;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};
