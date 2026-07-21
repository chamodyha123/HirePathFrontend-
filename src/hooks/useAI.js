// src/hooks/useAI.js
import { useState, useCallback } from 'react';
import candidateService from '../api/candidateService';

export function useAI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [progress, setProgress] = useState(0);

    const parseResume = useCallback(async (resumeText) => {
        setLoading(true);
        setError(null);
        setProgress(30);
        try {
            setProgress(60);
            const result = await candidateService.parseResumeWithAI(resumeText);
            setProgress(100);
            setData(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to parse resume');
            throw err;
        } finally {
            setLoading(false);
            setProgress(0);
        }
    }, []);

    const parseResumeFile = useCallback(async (file) => {
        setLoading(true);
        setError(null);
        setProgress(20);
        try {
            setProgress(50);
            const result = await candidateService.parseResumeFileWithAI(file);
            setProgress(100);
            setData(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to parse resume file');
            throw err;
        } finally {
            setLoading(false);
            setProgress(0);
        }
    }, []);

    const extractSkills = useCallback(async (text) => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.extractSkillsWithAI(text);
            setData(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to extract skills');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const matchCandidate = useCallback(async (jobId, candidateId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.matchCandidateToJob(jobId, candidateId);
            setData(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to match candidate');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const rankCandidates = useCallback(async (jobId, candidateIds) => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.rankCandidates(jobId, candidateIds);
            setData(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to rank candidates');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getRecommendations = useCallback(async (candidateId, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.getJobRecommendations(candidateId, limit);
            setData(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get recommendations');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAnalytics = useCallback(async (companyId, startDate = null, endDate = null) => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.getRecruitmentAnalytics(companyId, startDate, endDate);
            setData(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get analytics');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const generateReport = useCallback(async (companyId, reportType = 'comprehensive') => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.generateRecruitmentReport(companyId, reportType);
            setData(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate report');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearData = useCallback(() => {
        setData(null);
        setError(null);
        setProgress(0);
    }, []);

    return {
        loading,
        error,
        data,
        progress,
        parseResume,
        parseResumeFile,
        extractSkills,
        matchCandidate,
        rankCandidates,
        getRecommendations,
        getAnalytics,
        generateReport,
        clearData
    };
}