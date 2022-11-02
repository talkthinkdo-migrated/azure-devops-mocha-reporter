export interface ReporterOptions {
  organisation: string;
  project: string;
  planId: string;
  runName: string;
  pat: string;
  shouldAttachScreenShotsToTestResults: boolean;
}

export type ReporterOptionKeys = keyof ReporterOptions;

export interface MochaReporterConfig {
  reporterOptions: ReporterOptions;
}
