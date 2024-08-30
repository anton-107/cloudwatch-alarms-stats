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
exports.run = run;
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const luxon_1 = require("luxon");
const cloudwatch_stats_analyzer_1 = require("./cloudwatch-stats-analyzer");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // Define the time range for the past 3 months
        const startTime = luxon_1.DateTime.now().minus({ days: 30 }).toJSDate();
        const endTime = luxon_1.DateTime.now().toJSDate();
        console.log("Getting stats for period startTime", startTime, "endTime", endTime);
        // Create a CloudWatch client
        const cloudwatchClient = new client_cloudwatch_1.CloudWatchClient({});
        const stats = yield new cloudwatch_stats_analyzer_1.CloudwatchStatsAnalyzer(cloudwatchClient).getStatsIteratingThroughEachAlarm(startTime, endTime);
        console.log("stats", stats);
        return stats;
    });
}
