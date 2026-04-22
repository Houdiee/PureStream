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

export type SubmissionSeverity = 1 | 2 | 3;
/*
  Severity 1 - Revealing clothing (e.g bikini, lingerie, etc.)
  Severity 2 - Sexually suggestive content (e.g making out, kissing, etc.)
  Severity 3 - Nudity
*/

export type MediaType = "movie" | "tv";
