import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const utilisateurStocke = localStorage.getItem("utilisateurConnecte");
  const utilisateur = utilisateurStocke ? JSON.parse(utilisateurStocke) : null;

  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

