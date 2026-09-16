import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const data = localStorage.getItem("golfgoUser");

    if (!data) {
      alert("Belum ada akun. Silakan Register.");
      return;
    }

    const user = JSON.parse(data);

    if (email === user.email && password === user.password) {
      localStorage.setItem("isLogin", "true");
      alert("Login Berhasil!");
      navigate("/");
    } else {
      alert("Email atau Password salah");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Login GolfGo
        </h1>

        <input
  id="loginEmail"
  type="email"
  placeholder="Email"
  className="w-full border rounded-lg p-3 mb-4"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

       <input
  id="loginPassword"
  type="password"
  placeholder="Password"
  className="w-full border rounded-lg p-3 mb-6"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

<button
  id="loginButton"
  type="submit"
  className="w-full bg-green-700 text-white py-3 rounded-lg"
>
  Login
</button>
 <p className="text-center mt-4">
          Belum punya akun? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}