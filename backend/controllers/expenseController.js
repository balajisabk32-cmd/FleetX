import * as expenseService from '../services/expenseService.js';

export const addExpenseLog = async (req, res, next) => {
    try {
        const data = await expenseService.addExpenseLog(req.body);
        res.status(201).json({ success: true, message: 'Expense log created', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getExpenseLogs = async (req, res, next) => {
    try {
        const data = await expenseService.getExpenseLogs(req.query);
        res.status(200).json({ success: true, message: 'Expense logs fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getExpenseLogById = async (req, res, next) => {
    try {
        const data = await expenseService.getExpenseLogById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Expense log not found', data: null, errors: null });
        res.status(200).json({ success: true, message: 'Expense log fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const updateExpenseLog = async (req, res, next) => {
    try {
        const data = await expenseService.updateExpenseLog(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Expense log updated', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const deleteExpenseLog = async (req, res, next) => {
    try {
        await expenseService.deleteExpenseLog(req.params.id);
        res.status(200).json({ success: true, message: 'Expense log deleted', data: null, errors: null });
    } catch (error) {
        next(error);
    }
};
