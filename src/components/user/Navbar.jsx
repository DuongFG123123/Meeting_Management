// src/components/user/Navbar.jsx
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();
};

export default Navbar;