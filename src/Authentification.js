import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import imageBeige from "./image/mur-de-la-ville-avec-le-ciel.jpg";
import logoj from "./image/LOGO J.webp";
import { verifierConnexion } from "./data/baseDeDonnees";

const Authentification = () => {
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const utilisateurStocke = localStorage.getItem("utilisateurConnecte");
    if (utilisateurStocke) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // États pour le formulaire de connexion
  const [emailConnexion, changerEmailConnexion] = useState("");
  const [motDePasseConnexion, changerMotDePasseConnexion] = useState("");
  const [messageConnexion, changerMessageConnexion] = useState("");

  // Fonction pour gérer la connexion
  const gererConnexion = (e) => {
    e.preventDefault();

    if (!emailConnexion || !motDePasseConnexion) {
      changerMessageConnexion("Veuillez remplir tous les champs");
      return;
    }

    const resultat = verifierConnexion(emailConnexion, motDePasseConnexion);

    if (resultat.succes) {
      // Sauvegarder l'utilisateur connecté
      localStorage.setItem(
        "utilisateurConnecte",
        JSON.stringify(resultat.utilisateur)
      );
      // Naviguer vers le dashboard
      navigate("/dashboard");
    } else {
      changerMessageConnexion(resultat.message);
    }
  };

  // Afficher uniquement le formulaire de connexion
  return (
    <div className="Authentification">
      {/* section de la gauche  */}
      <div className="image">
        <img
          src={imageBeige}
          alt="Mur de la ville avec le ciel"
          loading="lazy"
        />
        <div className="nomlogo">
          <div className="nomlogotitre">JULEE</div>
          <div className="nomlogosoustitre">
            Votre gestionnaire de demande de projet{" "}
          </div>
        </div>
      </div>
      {/* section de la droite */}

      <div className="backsectionauth">
        <div className="sectionAuth">
          <div className="logoimage">
            <img src={logoj} alt="Logo Julee" loading="lazy" />
          </div>
          <br />
          <div className="contener">
            {/* Formulaire de connexion uniquement */}
            <div className="connecterzvous">
              {" "}
              BIENVENUE <br />
              connectez-vous à JULLEE
            </div>
            <br />
            {messageConnexion && (
              <div
                className={`message ${
                  messageConnexion.includes("réussie")
                    ? "message-succes"
                    : "message-erreur"
                }`}
              >
                {messageConnexion}
              </div>
            )}
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>

            <input
              id="email"
              type="email"
              placeholder="exemple@mail.fr"
              value={emailConnexion}
              onChange={(e) => changerEmailConnexion(e.target.value)}
              required
            />
            <br />
            <label htmlFor="password">
              Mot de passe <span className="required">*</span>
            </label>

            <input
              id="password"
              type="password"
              value={motDePasseConnexion}
              onChange={(e) => changerMotDePasseConnexion(e.target.value)}
              required
              placeholder="****************"
            />
            <br />
            <div className="lebouton" onClick={gererConnexion}>
              Se connecter
            </div>
            <br />
            <div
              className="creationcompte"
              style={{ textAlign: "center", color: "#666", fontSize: "0.9em" }}
            >
              Seuls les administrateurs peuvent créer des comptes.
              <br />
              Contactez votre administrateur pour obtenir un accès.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentification;
