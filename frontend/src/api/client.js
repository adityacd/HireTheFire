import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getJobs = (filters = {}) =>
  api.get("/jobs", { params: filters }).then((r) => r.data);

export const scrapeJobs = (payload) =>
  api.post("/jobs/scrape", payload).then((r) => r.data);

export const updateJobStatus = (jobId, status) =>
  api.patch(`/jobs/${jobId}/status`, { status }).then((r) => r.data);

export const getResume = () =>
  api.get("/resume").then((r) => r.data.content);

export const updateResume = (content) =>
  api.put("/resume", { content }).then((r) => r.data);
