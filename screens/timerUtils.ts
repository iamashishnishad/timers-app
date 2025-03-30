import { Timer } from './types';

export const startTimer = (id: string, prevTimers: Timer[]) =>
  prevTimers.map((timer) =>
    timer.id === id && timer.status !== 'Completed'
      ? { ...timer, status: 'Running' }
      : timer
  );

export const pauseTimer = (id: string, prevTimers: Timer[]) =>
  prevTimers.map((timer) =>
    timer.id === id && timer.status === 'Running'
      ? { ...timer, status: 'Paused' }
      : timer
  );

export const resetTimer = (id: string, prevTimers: Timer[]) =>
  prevTimers.map((timer) =>
    timer.id === id
      ? { ...timer, remaining: timer.duration, status: 'Paused' }
      : timer
  );

export const startAllInCategory = (category: string, prevTimers: Timer[]) =>
  prevTimers.map((timer) =>
    timer.category === timer.category && timer.status !== 'Completed'
      ? { ...timer, status: 'Running' }
      : timer
  );

export const pauseAllInCategory = (category: string, prevTimers: Timer[]) =>
  prevTimers.map((timer) =>
    timer.category === category && timer.status === 'Running'
      ? { ...timer, status: 'Paused' }
      : timer
  );

export const resetAllInCategory = (category: string, prevTimers: Timer[]) =>
  prevTimers.map((timer) =>
    timer.category === category
      ? { ...timer, remaining: timer.duration, status: 'Paused' }
      : timer
  );