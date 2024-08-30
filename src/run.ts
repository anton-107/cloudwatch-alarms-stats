import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";
import { DateTime } from "luxon";

import { CloudwatchStatsAnalyzer } from "./cloudwatch-stats-analyzer";

export async function run() {
  // Define the time range for the past 3 months
  const startTime = DateTime.now().minus({ days: 30 }).toJSDate();
  const endTime = DateTime.now().toJSDate();

  console.log(
    "Getting stats for period startTime",
    startTime,
    "endTime",
    endTime,
  );

  // Create a CloudWatch client
  const cloudwatchClient = new CloudWatchClient({});

  const stats = await new CloudwatchStatsAnalyzer(
    cloudwatchClient,
  ).getStatsIteratingThroughEachAlarm(startTime, endTime);
  console.log("stats", stats);
  return stats;
}
