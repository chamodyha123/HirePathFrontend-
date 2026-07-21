// src/api/index.js
import api from './axios';
import applicationApi, { 
    STATUS_VALUE, 
    statusLabel, 
    APPLICATION_STATUS,
    TERMINAL_STATUSES,
    normalizeApplication,
    normalizeCollection,
    normalizeStatus
} from './applicationApi';
import interviewApi, { INTERVIEW_TYPE } from './interviewApi';
import feedbackApi, { RECOMMENDATION } from './feedbackApi';
import evaluationApi from './evaluationApi';
import candidateService from './candidateService';
import recruiterService from './recruiterService';
import companyAdminService from './companyAdminService';
import platformAdminService from './platformAdminService';
import aiService from './aiService';

export {
    api,
    applicationApi,
    interviewApi,
    feedbackApi,
    evaluationApi,
    candidateService,
    recruiterService,
    companyAdminService,
    platformAdminService,
    aiService,
    // Constants
    STATUS_VALUE,
    statusLabel,
    APPLICATION_STATUS,
    TERMINAL_STATUSES,
    INTERVIEW_TYPE,
    RECOMMENDATION,
    // Helpers
    normalizeApplication,
    normalizeCollection,
    normalizeStatus,
};