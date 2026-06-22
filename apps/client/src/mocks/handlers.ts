
import { projectHandlers } from './projects.mock';
import { targetHandlers } from './targets.mock';
import { authHandlers } from './auth.mock';
import { datasetHandlers } from './datasets.mock';
import { reportHandlers } from './reports.mock';
import { rubricsHandlers } from './rubrics.mock';
import { aiHandlers } from './ai.mock';

export const handlers = [
  ...projectHandlers,
  ...targetHandlers,
  ...authHandlers,
  ...datasetHandlers,
  ...reportHandlers,
  ...rubricsHandlers,
  ...aiHandlers
];
