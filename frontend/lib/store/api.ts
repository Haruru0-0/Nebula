import axios from "axios";
import { SERVER_ADDR } from "./constant";
import secureLocalStorage from "react-secure-storage";

const api = axios.create({
    baseURL: SERVER_ADDR,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = secureLocalStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
