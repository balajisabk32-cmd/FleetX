import * as analyticsService from '../services/analyticsService.js';

export const getHealthScore = async (req, res, next) => {
    try {
        const data = await analyticsService.getHealthScore();
        res.status(200).json({ success: true, message: 'Health scores fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getExpenseForecast = async (req, res, next) => {
    try {
        const data = await analyticsService.getExpenseForecast();
        res.status(200).json({ success: true, message: 'Expense forecast fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getFuelTheft = async (req, res, next) => {
    try {
        const data = await analyticsService.getFuelTheft();
        res.status(200).json({ success: true, message: 'Fuel theft data fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getRankings = async (req, res, next) => {
    try {
        const data = await analyticsService.getRankings();
        res.status(200).json({ success: true, message: 'Rankings fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getMaintenanceSuggestions = async (req, res, next) => {
    try {
        const data = await analyticsService.getMaintenanceSuggestions();
        res.status(200).json({ success: true, message: 'Maintenance suggestions fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getDashboard = async (req, res, next) => {
    try {
        const data = await analyticsService.getDashboard();
        res.status(200).json({ success: true, message: 'Dashboard data fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};
