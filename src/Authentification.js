import { useState, useEffect } from "react";
import imageBeige from "./image/art.jpg";
import logoj from "./image/LOGO J.webp";
import { creerUtilisateur, verifierConnexion } from "./data/baseDeDonnees";
import PageAccueil from "./PageAccueil";

const Authentification = () => {
  // État pour vérifier si l'utilisateur est connecté
  const [utilisateurConnecte, changerUtilisateurConnecte] = useState(null);
  const [afficherCreation, changerAfficher] = useState(false);
  
  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const utilisateurStocke = localStorage.getItem("utilisateurConnecte");
    if (utilisateurStocke) {
      changerUtilisateurConnecte(JSON.parse(utilisateurStocke));
    }
  }, []);
  
  // États pour le formulaire de connexion
  const [emailConnexion, changerEmailConnexion] = useState("");
  const [motDePasseConnexion, changerMotDePasseConnexion] = useState("");
  const [messageConnexion, changerMessageConnexion] = useState("");
  
  // États pour le formulaire de création
  const [prenom, changerPrenom] = useState("");
  const [nom, changerNom] = useState("");
  const [emailCreation, changerEmailCreation] = useState("");
  const [motDePasseCreation, changerMotDePasseCreation] = useState("");
  const [confirmerMotDePasse, changerConfirmerMotDePasse] = useState("");
  const [messageCreation, changerMessageCreation] = useState("");

  const clicCreer = (e) => {
    e.preventDefault();
    changerAfficher(true);
    changerMessageConnexion("");
  };

  const clicRetour = (e) => {
    e.preventDefault();
    changerAfficher(false);
    changerMessageCreation("");
  };
  
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
      localStorage.setItem("utilisateurConnecte", JSON.stringify(resultat.utilisateur));
      // Changer l'état pour afficher la page d'accueil
      changerUtilisateurConnecte(resultat.utilisateur);
    } else {
      changerMessageConnexion(resultat.message);
    }
  };
  
  // Fonction pour se déconnecter
  const deconnecter = () => {
    localStorage.removeItem("utilisateurConnecte");
    changerUtilisateurConnecte(null);
    changerEmailConnexion("");
    changerMotDePasseConnexion("");
    changerMessageConnexion("");
  };
  
  // Fonction pour gérer la création de compte
  const gererCreation = (e) => {
    e.preventDefault();
    
    // Vérifier que tous les champs sont remplis
    if (!prenom || !nom || !emailCreation || !motDePasseCreation || !confirmerMotDePasse) {
      changerMessageCreation("Veuillez remplir tous les champs");
      return;
    }
    
    // Vérifier que les mots de passe correspondent
    if (motDePasseCreation !== confirmerMotDePasse) {
      changerMessageCreation("Les mots de passe ne correspondent pas");
      return;
    }
    
    // Créer l'utilisateur
    const resultat = creerUtilisateur(prenom, nom, emailCreation, motDePasseCreation);
    
    if (resultat.succes) {
      changerMessageCreation("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      // Réinitialiser les champs
      changerPrenom("");
      changerNom("");
      changerEmailCreation("");
      changerMotDePasseCreation("");
      changerConfirmerMotDePasse("");
      // Retourner au formulaire de connexion après 2 secondes
      setTimeout(() => {
        changerAfficher(false);
        changerMessageCreation("");
      }, 2000);
    } else {
      changerMessageCreation(resultat.message);
    }
  };

  // Si l'utilisateur est connecté, afficher la page d'accueil
  if (utilisateurConnecte) {
    return <PageAccueil utilisateur={utilisateurConnecte} deconnecter={deconnecter} />;
  }

  // Sinon, afficher le formulaire de connexion/création
  return (
    <div className="Authentification">
      {/* section de la gauche  */}
      <div className="image">
        <img src={imageBeige} alt="Image beige" loading="lazy" />
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
            {!afficherCreation ? (
              // Formulaire de connexion
              <>
                <div className="connecterzvous">
                  {" "}
                  BIENVENUE <br />
                  connectez-vous à JULLEE
                </div>
                <br />
                {messageConnexion && (
                  <div className={`message ${messageConnexion.includes("réussie") ? "message-succes" : "message-erreur"}`}>
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
                <div className="lebouton" onClick={gererConnexion}>Se connecter</div>
                <br />
                <div className="creationcompte">
                  <a href="" onClick={clicCreer}>
                    créer un compte{" "}
                  </a>
                </div>
                <br />
                <div className="administrateur">
                  <a href="">connecter vous en tant qu'administrateur</a>
                </div>
              </>
            ) : (
              // Formulaire de création de compte
              <>
                <div className="connecterzvous">
                  CRÉER UN COMPTE <br />
                  Rejoignez JULEE
                </div>
                <br />
                {messageCreation && (
                  <div className={`message ${messageCreation.includes("succès") ? "message-succes" : "message-erreur"}`}>
                    {messageCreation}
                  </div>
                )}
                <label htmlFor="prenom">
                  Prénom <span className="required">*</span>
                </label>
                <input
                  id="prenom"
                  type="text"
                  placeholder="Votre prénom"
                  value={prenom}
                  onChange={(e) => changerPrenom(e.target.value)}
                  required
                />
                <br />
                <label htmlFor="nom">
                  Nom <span className="required">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Votre nom"
                  value={nom}
                  onChange={(e) => changerNom(e.target.value)}
                  required
                />
                <br />
                <label htmlFor="emailSignUp">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="emailSignUp"
                  type="email"
                  placeholder="exemple@mail.fr"
                  value={emailCreation}
                  onChange={(e) => changerEmailCreation(e.target.value)}
                  required
                />
                <br />
                <label htmlFor="passwordSignUp">
                  Mot de passe <span className="required">*</span>
                </label>
                <input
                  id="passwordSignUp"
                  type="password"
                  value={motDePasseCreation}
                  onChange={(e) => changerMotDePasseCreation(e.target.value)}
                  required
                  placeholder="****************"
                />
                <br />
                <label htmlFor="confirmPassword">
                  Confirmer le mot de passe <span className="required">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmerMotDePasse}
                  onChange={(e) => changerConfirmerMotDePasse(e.target.value)}
                  required
                  placeholder="****************"
                />
                <br />
                <div className="lebouton" onClick={gererCreation}>Créer mon compte</div>
                <br />
                <div className="creationcompte">
                  <a href="" onClick={clicRetour}>
                    Déjà un compte ? Se connecter
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentification;
