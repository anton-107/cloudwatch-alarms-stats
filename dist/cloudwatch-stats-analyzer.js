"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudwatchStatsAnalyzer = void 0;
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
/**
 * Pauses the execution of an async function for the specified duration.
 * @param ms The number of milliseconds to wait before resolving the Promise.
 * @returns A Promise that resolves after the specified duration.
 */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
class CloudwatchStatsAnalyzer {
    constructor(cloudwatchClient) {
        this.cloudwatchClient = cloudwatchClient;
    }
    getStatsIteratingThroughEachAlarm(startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve a list of all alarms:
            const allAlarms = yield this.fetchAlarms();
            console.log("total alarms count", allAlarms.length);
            const alarmCounts = {};
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
                console.log(`Fetching alarm history for ${alarm.AlarmName} (${i} out of ${recentAlarms.length})`);
                const alarms = yield this.fetchAlarmHistory(alarm.AlarmName, startTime, endTime);
                alarms.forEach((alarm) => {
                    if (!alarm.HistoryData || !alarm.AlarmName) {
                        return;
                    }
                    const historyData = JSON.parse(alarm.HistoryData);
                    if (historyData.newState.stateValue === "ALARM") {
                        alarmCounts[alarm.AlarmName] =
                            (alarmCounts[alarm.AlarmName] || 0) + 1;
                    }
                });
                yield sleep(150);
            }
            // Sort the alarms by the number of times they went into the alarm state (descending order)
            const sortedAlarms = Object.entries(alarmCounts).sort(([_, count1], [__, count2]) => count2 - count1);
            // Print the list of alarms sorted by the number of times they went into the alarm state
            sortedAlarms.forEach(([alarmName, count]) => {
                console.log(`Alarm Name: ${alarmName}, Times in Alarm State: ${count}`);
            });
        });
    }
    fetchAlarms() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const compositeAlarms = [];
            const metricsAlarms = [];
            let nextToken;
            do {
                const command = new client_cloudwatch_1.DescribeAlarmsCommand({ NextToken: nextToken });
                const response = yield this.cloudwatchClient.send(command);
                (_a = response.CompositeAlarms) === null || _a === void 0 ? void 0 : _a.map((x) => compositeAlarms.push(x));
                (_b = response.MetricAlarms) === null || _b === void 0 ? void 0 : _b.map((x) => metricsAlarms.push(x));
                nextToken = response.NextToken;
            } while (nextToken);
            return [...compositeAlarms, ...metricsAlarms];
        });
    }
    fetchAlarmHistory(alarmName, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const results = [];
            let nextToken;
            do {
                const command = new client_cloudwatch_1.DescribeAlarmHistoryCommand({
                    AlarmName: alarmName,
                    HistoryItemType: "StateUpdate",
                    StartDate: startTime,
                    EndDate: endTime,
                    MaxRecords: 100,
                    NextToken: nextToken,
                });
                const response = yield this.cloudwatchClient.send(command);
                (_a = response.AlarmHistoryItems) === null || _a === void 0 ? void 0 : _a.map((x) => results.push(x));
                nextToken = response.NextToken;
            } while (nextToken);
            return results;
        });
    }
}
exports.CloudwatchStatsAnalyzer = CloudwatchStatsAnalyzer;
