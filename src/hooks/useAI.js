// src/hooks/useAI.js
import { useState } from 'react';
import candidateService from '../api/candidateService';

export function useAI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    const parseResume = async (text) => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.parseResumeWithAI(text);
            setResults(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to parse resume');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const parseResumeFile = async (file) => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.parseResumeFileWithAI(file);
            setResults(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to parse resume file');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const extractSkills = async (text) => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.extractSkillsWithAI(text);
            setResults(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to extract skills');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getRecommendations = async (candidateId, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const result = await candidateService.getJobRecommendations(candidateId, limit);
            setResults(result);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get recommendations');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        results,
        parseResume,
        parseResumeFile,
        extractSkills,
        getRecommendations,
        clearResults: () => setResults(null)
    };
}