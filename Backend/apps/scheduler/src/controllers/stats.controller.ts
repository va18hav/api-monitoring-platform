import { Request, Response, NextFunction } from 'express';
import { prisma } from 'db';

export const getMonitorStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        
        const totalProjects = await prisma.project.count({
            where: { userId }
        });

        const totalEndpoints = await prisma.endpoint.count({
            where: { project: { userId } }
        });
        
        const totalChecks = await prisma.response.count({
            where: { endpoint: { project: { userId } } }
        });
        
        const failedChecks = await prisma.response.count({
            where: {
                status: 'DOWN',
                endpoint: { project: { userId } }
            }
        });

        const uptimePercentage = totalChecks > 0 
            ? Math.round(((totalChecks - failedChecks) / totalChecks) * 100) 
            : 100;

        const recentEndpoints = await prisma.endpoint.findMany({
            where: {
                project: {
                    userId
                }
            },
            take: 5,
            orderBy: {
                updatedAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                url: true,
                method: true,
                interval: true,
                status: true,
                project: {
                    select: {
                        name: true
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalProjects,
                totalEndpoints,
                uptimePercentage,
                totalAlerts: failedChecks,
                recentEndpoints
            }
        });
    } catch (error) {
        next(error);
    }
};
