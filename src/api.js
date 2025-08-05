import axios from "axios";

const API = axios.create({
  baseURL: "https://eat-track-fit-backend.onrender.com/api",
});

export default API;
