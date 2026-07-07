import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:7253/api",
});

export default api;