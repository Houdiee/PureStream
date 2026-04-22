import { SubmissionSeverity } from "./submission";

export type Config = {
  [K in SubmissionSeverity as `severity${K}`]: FilterAction;
};

export type FilterAction = "Nothing" | "Blur" | "Blackout" | "Skip";

export const defaultConfig: Config = {
  severity1: "Blur",
  severity2: "Skip",
  severity3: "Skip",
};
