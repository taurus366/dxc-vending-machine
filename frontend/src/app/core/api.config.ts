/**
 * Base URL of the mocked products API (Spring Boot backend).
 * Only used once on startup to fetch the initial product catalog -
 * every subsequent product change happens purely in the Angular
 * application state.
 */
export const API_BASE_URL = 'http://localhost:8080/api';
