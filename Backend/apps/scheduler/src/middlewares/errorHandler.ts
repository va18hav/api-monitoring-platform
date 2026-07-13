import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'
import { logger } from 'shared'
import { ZodError } from 'zod'

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Log the error using request-scoped child logger to preserve tracking UUID
    const log = req.log || logger;
    log.error({ err }, "Global error caught");

    // 1. Zod Validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
        return;
    }

    // 2. Custom application errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors && { errors: err.errors }),
        })
        return
    }

    // 3. Unexpected errors (bugs, DB connection failures, etc.)
    res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
    })
}
