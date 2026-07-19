import axios from 'axios';

const instance = axios.create({
    baseURL: "http://localhost:5139/api",
    headers: {
        "Content-Type": "application/json",
    }
});

// 💡 Axios Interceptor එකක් මඟින් හැම රික්වෙස්ට් එකකටම Token එක එකතු කිරීම
instance.interceptors.request.use(
    (config) => {
        // LocalStorage එකෙන් Token එක ලබා ගැනීම
        const token = localStorage.getItem("token");
        
        // Token එක පවතිනවා නම් එය Authorization Header එකට 'Bearer' ආකාරයෙන් ඇතුළත් කිරීම
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✨ [අලුතින් එකතු කල කොටස]: Backend එකෙන් ලැබෙන Responses Handle කිරීමට Interceptor එකක්
instance.interceptors.response.use(
    (response) => {
        // Request එක සාර්ථක නම් කෙලින්ම response එක pass කරනවා
        return response;
    },
    (error) => {
        // Token එක Expire වෙලා හෝ Invalid වෙලා 401 Unauthorized ආවොත්
        if (error.response && error.response.status === 401) {
            // LocalStorage එක Clear කරලා User ව Login Page එකට Redirect කරනවා
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // SPA එක ඇතුලේ Window location එක මඟින් Login එකට පන්නනවා
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default instance;