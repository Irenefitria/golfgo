import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import "./index.css";

import App from "./App";
import AdminApp from "./AdminApp";

import Register from "./pages/Register";
import Login from "./pages/Login";

ReactDOM.createRoot(document.getElementById("root")).render(

<React.StrictMode>

<BrowserRouter>

<Routes>

<Route path="/" element={<App />} />

<Route path="/register" element={<Register />} />

<Route path="/login" element={<Login />} />

<Route path="/admin/*" element={<AdminApp />} />

</Routes>

</BrowserRouter>

</React.StrictMode>

);