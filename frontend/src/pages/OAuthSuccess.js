import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthSuccess({ setAuth }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const role = searchParams.get("role");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);

      setAuth({ isAuthenticated: true, role });
      navigate("/"); // ✅ Redirect to homepage
    } else {
      navigate("/login", { state: { message: "OAuth login failed." } });
    }
  }, []);

  return <p>Logging you in...</p>;
}
