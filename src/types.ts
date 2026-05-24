/**
 * SPDX-License-Identifier: Apache-2.0
 */

export type PandaRole = 'friend' | 'partner' | 'teacher' | 'mom' | 'yoga';

export interface ChatMessage {
  id: string;
  sender: 'student' | 'panda';
  text: string;
  timestamp: string;
  role?: PandaRole;
  attachedFile?: {
    name: string;
    type: string;
    previewUrl?: string; // base64 encoded thumbnail if exists
  };
}

export interface NCERTChapter {
  id: string;
  subject: 'Math' | 'Science';
  number: number;
  title: string;
  topics: string[];
  notesSnippet: string;
  practiceQuestions: PracticeQuestion[];
}

export interface PracticeQuestion {
  id: string;
  question: string;
  hints: string[]; // Scaffolded (2-4 hints)
  solution: string;
}

export interface YogaPose {
  name: string;
  benefits: string;
  durationSeconds: number;
  steps: string[];
  emoji: string;
}

export interface YogaSequence {
  id: string;
  title: string;
  emoji: string;
  durationMinutes: number;
  description: string;
  poses: YogaPose[];
  safetyTips: string[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string; // e.g. "07:00 AM"
  durationMinutes: number;
  category: 'study' | 'yoga' | 'rest' | 'craft' | 'school';
  done?: boolean;
}

export interface StudentMoodRecord {
  date: string; // "YYYY-MM-DD"
  score: number; // 1 to 5
  emoji: string;
  note: string;
  activities: string[]; // list of completed categories (e.g. ['Math Ch 1', 'Yoga Wakeup'])
}
