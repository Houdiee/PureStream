import { Submission, SubmissionSeverity } from "../submission";
import init, { getClusterLabels } from "../../cluster-engine/pkg/cluster_engine";

export type Segment = {
  start: number;
  end: number;
  severity: SubmissionSeverity;
};

export const calculateSegments = async (submissions: Submission[]) => {
  if (submissions.length === 0) return [];
  await init();

  const flatPoints = new Float64Array(submissions.flatMap((s) => [s.start, s.end]));
  const labels = getClusterLabels(flatPoints);
  const clusterMap = new Map<number, Submission[]>();
  labels.forEach((label, i) => {
    if (label === -1) return;
    if (!clusterMap.has(label)) clusterMap.set(label, []);
    clusterMap.get(label)!.push(submissions[i]);
  });

  const clusterGroups = Array.from(clusterMap.values());
  const peakCount = Math.max(...clusterGroups.map((g) => g.filter((s) => !s.isReport).length), 0);

  const validClusters = clusterGroups.filter((group) => {
    const adds = group.filter((s) => !s.isReport).length;
    const reports = group.length - adds;
    return adds >= peakCount * 0.33 && adds >= reports && adds > 0;
  });

  const segments: Segment[] = validClusters.map((group) => {
    const addsOnly = group.filter((s) => !s.isReport);
    const count = addsOnly.length;

    const avgStart = addsOnly.reduce((acc, s) => acc + s.start, 0) / count;
    const avgEnd = addsOnly.reduce((acc, s) => acc + s.end, 0) / count;
    const avgSeverity = addsOnly.reduce((acc, s) => acc + s.severity, 0) / count;

    return {
      start: Number(avgStart.toFixed(2)),
      end: Number(avgEnd.toFixed(2)),
      severity: Math.round(avgSeverity) as SubmissionSeverity,
    };
  });

  return segments.sort((a, b) => a.start - b.start);
};
