import { http } from 'msw';
import { projectHandlers } from './projects.mock';
import { targetHandlers } from './targets.mock';
import { authHandlers } from './auth.mock';

export const handlers = [
  ...projectHandlers,
  ...targetHandlers,
  ...authHandlers
];
