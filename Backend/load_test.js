import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Define Load Profile (Virtual Users and Stages)
export const options = {
    stages: [
        { duration: '15s', target: 50 }, // Ramp up to 50 virtual users
        { duration: '30s', target: 50 }, // Hold at 50 virtual users
        { duration: '15s', target: 0 },  // Ramp down to 0
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],   // Under 1% failure rate
        http_req_duration: ['p(95)<300'], // 95% of requests under 300ms
    },
};

// Target URL: Deployed EC2 endpoint root
const BASE_URL = 'https://ping-loop.duckdns.org';

// 2. Load Test Scenario Execution Flow
export default function () {
    // Query metrics to evaluate raw server throughput under concurrent loads
    let res = http.get(`${BASE_URL}/metrics`);
    
    check(res, {
        'Metrics returned 200 OK': (r) => r.status === 200,
    });

    sleep(0.5); // 500ms sleep between requests per virtual user
}
