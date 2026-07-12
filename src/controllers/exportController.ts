import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService';
import * as fuelService from '../services/fuelService';
import * as expenseService from '../services/expenseService';

const jsonToCsv = (jsonData: any[]) => {
    if (!jsonData || jsonData.length === 0) return '';
    
    const processRow = (row: any) => {
        const processed: any = {};
        for (const [key, value] of Object.entries(row)) {
            if (typeof value === 'object' && value !== null) {
                if ((value as any).license_plate) processed[key] = (value as any).license_plate;
                else if ((value as any).registration_number) processed[key] = (value as any).registration_number;
                else processed[key] = JSON.stringify(value).replace(/,/g, ';');
            } else {
                processed[key] = value;
            }
        }
        return processed;
    };

    const processedData = jsonData.map(processRow);
    const keys = Object.keys(processedData[0]);
    const csvRows = [];
    csvRows.push(keys.join(','));

    for (const row of processedData) {
        const values = keys.map(k => {
            let val = row[k] === null || row[k] === undefined ? '' : row[k].toString();
            if (val.includes(',')) val = `"${val}"`;
            return val;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

export const exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = req.query.type as string;
        let dataToExport: any[] = [];
        let filename = 'export.csv';

        if (type === 'analytics') {
            dataToExport = await analyticsService.getHealthScore();
            filename = 'analytics_report.csv';
        } else if (type === 'fuel') {
            const result = await fuelService.getFuelLogs({ limit: 10000 });
            dataToExport = result.data;
            filename = 'fuel_logs.csv';
        } else if (type === 'expense') {
            const result = await expenseService.getExpenseLogs({ limit: 10000 });
            dataToExport = result.data;
            filename = 'expense_logs.csv';
        } else {
            return res.status(400).json({ success: false, message: 'Invalid export type' });
        }

        const csvString = jsonToCsv(dataToExport);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvString);
    } catch (error) {
        next(error);
    }
};
