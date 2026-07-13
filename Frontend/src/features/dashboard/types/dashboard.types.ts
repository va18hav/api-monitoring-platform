export interface RecentEndpoint {
    id: string;
    name: string;
    url: string;
    method: string;
    interval: number;
    status: string;
    project: {
        name: string;
    };
}

export interface MonitorStats {
    totalProjects: number;
    totalEndpoints: number;
    uptimePercentage: number;
    totalAlerts: number;
    recentEndpoints?: RecentEndpoint[];
}
