
import { projectHandlers } from './projects.mock';
import { targetHandlers } from './targets.mock';
import { authHandlers } from './auth.mock';
import { datasetHandlers } from './datasets.mock';

export const handlers = [
  ...projectHandlers,
  ...targetHandlers,
  ...authHandlers,
  ...datasetHandlers
];
