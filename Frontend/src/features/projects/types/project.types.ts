export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export interface Endpoint {
    id: string;
    name: string;
    url: string;
    method: string;
    interval: number;
    status: string; // 'UP' | 'DOWN' | 'PENDING'
    projectId: string;
    createdAt: string;
}
