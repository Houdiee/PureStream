export type MediaType = "movie" | "tv";
export type SubmissionSeverity = 1 | 2 | 3;
export type Submission = {
  id: number;
  mediaID: number;
  severity: SubmissionSeverity;
  start: number;
  end: number;
  season?: number;
  episode?: number;
  isReport: boolean;
};
