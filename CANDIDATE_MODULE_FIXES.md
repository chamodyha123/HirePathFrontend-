# Candidate module integration fixes

- Corrected profile GET/POST/PUT requests.
- Removed hardcoded candidate IDs and Candidate API URLs.
- Connected profile, skills, education, experience, and resumes through the shared Axios client.
- Resume upload/delete/set-primary and public file links are connected.
- Frontend production build completed successfully.

Use `VITE_API_BASE_URL=http://localhost:5139/api` when running locally.
