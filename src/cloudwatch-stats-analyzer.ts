import {
  AlarmHistoryItem,
  CloudWatchClient,
  CompositeAlarm,
  DescribeAlarmHistoryCommand,
  DescribeAlarmsCommand,
  MetricAlarm,
} from "@aws-sdk/client-cloudwatch";

interface HistoryData {
  newState: {
    stateValue: "OK" | "ALARM" | "INSUFFICIENT_DATA";
  };
}

interface Alarm {
  AlarmName?: string;
  StateUpdatedTimestamp?: Date;
}

/**
 * Pauses the execution of an async function for the specified duration.
 * @param ms The number of milliseconds to wait before resolving the Promise.
 * @returns A Promise that resolves after the specified duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class CloudwatchStatsAnalyzer {
  constructor(private cloudwatchClient: CloudWatchClient) {}
  public async getStatsIteratingThroughEachAlarm(
    startTime: Date,
    endTime: Date,
  ) {
    // Retrieve a list of all alarms:
    const allAlarms = await this.fetchAlarms();
    console.log("total alarms count", allAlarms.length);

    const alarmCounts: { [key: string]: number } = {};

    const recentAlarms = allAlarms
      .filter((x) => x.StateUpdatedTimestamp)
      .filter((x) => {
        return (x.StateUpdatedTimestamp || 0) > startTime;
      });
    console.log("total recent alarms count", recentAlarms.length);

    for (let i = 0; i < recentAlarms.length; i++) {
      const alarm = recentAlarms[i];
      if (!alarm.AlarmName) {
        continue;
      }

      // Retrieve all the alarm metric data for the specified time range
      console.log(
        `Fetching alarm history for ${alarm.AlarmName} (${i} out of ${recentAlarms.length})`,
      );
      const alarms = await this.fetchAlarmHistory(
        alarm.AlarmName,
        startTime,
        endTime,
      );

      alarms.forEach((alarm) => {
        if (!alarm.HistoryData || !alarm.AlarmName) {
          return;
        }
        const historyData: HistoryData = JSON.parse(alarm.HistoryData);

        if (historyData.newState.stateValue === "ALARM") {
          alarmCounts[alarm.AlarmName] =
            (alarmCounts[alarm.AlarmName] || 0) + 1;
        }
      });

      await sleep(150);
    }

    // Sort the alarms by the number of times they went into the alarm state (descending order)
    const sortedAlarms = Object.entries(alarmCounts).sort(
      ([_, count1], [__, count2]) => count2 - count1,
    );

    // Print the list of alarms sorted by the number of times they went into the alarm state
    sortedAlarms.forEach(([alarmName, count]) => {
      console.log(`Alarm Name: ${alarmName}, Times in Alarm State: ${count}`);
    });
  }

  private async fetchAlarms(): Promise<Alarm[]> {
    const compositeAlarms: CompositeAlarm[] = [];
    const metricsAlarms: MetricAlarm[] = [];

    let nextToken: string | undefined;
    do {
      const command = new DescribeAlarmsCommand({ NextToken: nextToken });
      const response = await this.cloudwatchClient.send(command);
      response.CompositeAlarms?.map((x) => compositeAlarms.push(x));
      response.MetricAlarms?.map((x) => metricsAlarms.push(x));
      nextToken = response.NextToken;
    } while (nextToken);
    return [...compositeAlarms, ...metricsAlarms];
  }

  private async fetchAlarmHistory(
    alarmName: string,
    startTime: Date,
    endTime: Date,
  ): Promise<AlarmHistoryItem[]> {
    const results: AlarmHistoryItem[] = [];
    let nextToken: string | undefined;

    do {
      const command = new DescribeAlarmHistoryCommand({
        AlarmName: alarmName,
        HistoryItemType: "StateUpdate",
        StartDate: startTime,
        EndDate: endTime,
        MaxRecords: 100,
        NextToken: nextToken,
      });

      const response = await this.cloudwatchClient.send(command);
      response.AlarmHistoryItems?.map((x) => results.push(x));
      nextToken = response.NextToken;
    } while (nextToken);

    return results;
  }
}
