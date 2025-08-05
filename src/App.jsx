import { Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Log from "./pages/Log";
import SavedFoods from "./pages/SavedFoods";

export default function App() {
  return (
    <>
      <nav>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/log" element={<Log />} />
        <Route path="/savedfoods" element={<SavedFoods />} />
      </Routes>
    </>
  );
}
