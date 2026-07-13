import pino from 'pino';
import client from 'prom-client';
export declare const logger: pino.Logger<never, boolean>;
export declare const jobsProcessedTotal: client.Counter<"type" | "status">;
export declare const jobExecutionDurationSeconds: client.Histogram<"type">;
export declare const register: client.Registry<"text/plain; version=0.0.4; charset=utf-8">;
