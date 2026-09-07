export type PortfolioWorkerEnv = {
  ASSETS?: {
    fetch(request: Request): Promise<Response>;
  };
  DEPLOYMENT_ENV?: string;
  SITE_VERSION?: string;
  SYSTEM_STATUS_SOURCE?: string;
  SYSTEM_STATUS_URL?: string;
  SYSTEM_STATUS_TOKEN?: string;
  SYSTEM_STATUS_TIMEOUT_MS?: string;
};

export type WorkerDependencies = {
  fetch?: typeof fetch;
  now?: () => Date;
};
