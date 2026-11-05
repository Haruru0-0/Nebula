import axios from "axios";
import { SERVER_ADDR } from "./constant";
import { announceSessionExpired, setSessionExpiry } from "../session";

// The login is an HttpOnly cookie, sent because of withCredentials. The custom header is required by the server on
// requests that change data, so another site cannot forge them.
const api = axios.create({
    baseURL: SERVER_ADDR,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "nebula",
    },
});

// Calls that are expected to answer 401 or run while signed out
const AUTH_FREE = ["/auth/signin", "/auth/signup", "/auth/verify-email", "/auth/resend-verification", "/auth/forgot-password", "/auth/reset-password", "/auth/logout", "/auth/refresh"];

// One refresh at a time: when several requests fail together they share the same refresh.
let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
    if (!refreshing) {
        refreshing = api
            .post("/auth/refresh")
            .then((res) => {
                setSessionExpiry(res.data?.data?.sessionEndsAt);
                return true;
            })
            .catch(async (error) => {
                // Another tab refreshed a moment ago and its new cookie is already in place: just try again
                if (error?.response?.data?.reason === "raced") {
                    await new Promise((r) => setTimeout(r, 400));
                    return true;
                }
                return false;
            })
            .finally(() => {
                refreshing = null;
            });
    }
    return refreshing;
}

// The access token lives about 15 minutes. A 401 usually means it ran out, so quietly get a new one with the
// refresh cookie and repeat the request. Only if that fails is the session really over.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const config = error?.config;
        const url: string = config?.url ?? "";
        if (status === 401 && config && !AUTH_FREE.some((p) => url.includes(p))) {
            if (!config._retried && (await refreshSession())) {
                config._retried = true;
                return api(config);
            }
            announceSessionExpired();
        }
        return Promise.reject(error);
    }
);

export default api;
