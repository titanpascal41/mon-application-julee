// Page d'accueil affichée après la connexion
const PageAccueil = ({ utilisateur, deconnecter }) => {
  return (
    <div style={{
      width: "100%",
      height: "100vh",
      backgroundColor: "#4CAF50", // Vert
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontSize: "24px"
    }}>
      <h1>Bienvenue {utilisateur.prenom} {utilisateur.nom} !</h1>
      <p>Vous êtes connecté à JULEE</p>
      <button 
        onClick={deconnecter}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "white",
          color: "#4CAF50",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
};

export default PageAccueil;

