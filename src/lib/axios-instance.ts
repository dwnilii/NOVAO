import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
  // This ensures that cookies (like the session cookie from the panel)
  // are sent with every request from the client-side.
  withCredentials: true,
});

export default api;
