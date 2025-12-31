import { useState, useEffect, useCallback } from "react";
import "./PageStyles.css";
import { chargerBugs, creerBug } from "../../data/gestionBugs";

const Bugs = ({ activeSubPage: activeSubPageProp }) => {
  const [activeSubPage, setActiveSubPage] = useState("declaration-qualification");
  const [showForm, setShowForm] = useState(false);
  const [bugs, setBugs] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    descriptionCourte: "",
    descriptionDetaillee: "",
    fonctionnaliteImpactee: "",
    moduleImpacte: "",
    severite: "",
    priorite: "Moyenne",
    captureEcran: null
  });

  // Liste des modules disponibles
  const modulesDisponibles = [
    "Dashboard",
    "Administration",
    "Paramétrage",
    "Demandes",
    "Plan de Charge Équipes",
    "Planning Projet",
    "Recette et Livraison",
    "Bugs",
    "Analyse et Calcul de Performance",
    "Kanban"
  ];

  useEffect(() => {
    if (activeSubPageProp) {
      // Vérifier les cas les plus spécifiques d'abord
      if (activeSubPageProp.includes("suivi-resolution") || 
          activeSubPageProp.includes("resolution-cloture") ||
          activeSubPageProp.includes("cloture")) {
        setActiveSubPage("suivi-resolution-cloture");
      } else if (activeSubPageProp.includes("declaration") || 
                 activeSubPageProp.includes("qualification")) {
        setActiveSubPage("declaration-qualification");
      }
    }
  }, [activeSubPageProp]);

  const chargerLesBugs = useCallback(() => {
    const bugsCharges = chargerBugs();
    setBugs(bugsCharges);
  }, []);

  useEffect(() => {
    if (activeSubPage === "declaration-qualification") {
      chargerLesBugs();
    }
  }, [activeSubPage, chargerLesBugs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer les messages d'erreur lors de la saisie
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convertir le fichier en base64 pour le stockage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          captureEcran: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    setFormData({
      descriptionCourte: "",
      descriptionDetaillee: "",
      fonctionnaliteImpactee: "",
      moduleImpacte: "",
      severite: "",
      priorite: "Moyenne",
      captureEcran: null
    });
    setShowForm(true);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Récupérer l'utilisateur connecté
    const utilisateurConnecte = localStorage.getItem("utilisateurConnecte");
    let declarant = "Utilisateur inconnu";
    if (utilisateurConnecte) {
      const user = JSON.parse(utilisateurConnecte);
      declarant = `${user.prenom} ${user.nom}`;
    }

    // Préparer les données du bug
    const bugData = {
      ...formData,
      declarant: declarant,
      dateCreation: new Date().toISOString(),
      statut: "Ouvert"
    };

    // Créer le bug
    const resultat = creerBug(bugData);
    
    if (resultat.succes) {
      setMessage({ type: "success", text: resultat.message });
      setShowForm(false);
      chargerLesBugs();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } else {
      setMessage({ type: "error", text: resultat.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      descriptionCourte: "",
      descriptionDetaillee: "",
      fonctionnaliteImpactee: "",
      moduleImpacte: "",
      severite: "",
      priorite: "Moyenne",
      captureEcran: null
    });
    setMessage({ type: "", text: "" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getSeveriteColor = (severite) => {
    switch (severite) {
      case "Bloquant":
        return "#ef4444";
      case "Majeur":
        return "#f59e0b";
      case "Mineur":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getPrioriteColor = (priorite) => {
    switch (priorite) {
      case "Haute":
        return "#ef4444";
      case "Moyenne":
        return "#f59e0b";
      case "Basse":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const subPages = {
    "declaration-qualification": {
      title: "Déclaration et Qualification des Bugs",
      content: (
        <div>
          {message.text && (
            <div className={`message ${message.type === "success" ? "message-succes" : "message-erreur"}`}>
              {message.text}
            </div>
          )}

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreate}>
              Déclarer un bug
            </button>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={handleCancel}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Déclarer un bug</h3>
                  <button className="modal-close" onClick={handleCancel}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="dateCreation">
                        Date de création
                      </label>
                      <input
                        type="text"
                        id="dateCreation"
                        name="dateCreation"
                        value={formatDate(new Date().toISOString())}
                        disabled
                        style={{ backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" }}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="descriptionCourte">
                        Description courte <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="descriptionCourte"
                        name="descriptionCourte"
                        value={formData.descriptionCourte}
                        onChange={handleInputChange}
                        placeholder="Résumé du bug en quelques mots"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="descriptionDetaillee">
                        Description détaillée
                      </label>
                      <textarea
                        id="descriptionDetaillee"
                        name="descriptionDetaillee"
                        value={formData.descriptionDetaillee}
                        onChange={handleInputChange}
                        placeholder="Décrivez le bug en détail : étapes pour le reproduire, comportement attendu vs comportement observé..."
                        rows="5"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fonctionnaliteImpactee">
                        Fonctionnalité impactée
                      </label>
                      <input
                        type="text"
                        id="fonctionnaliteImpactee"
                        name="fonctionnaliteImpactee"
                        value={formData.fonctionnaliteImpactee}
                        onChange={handleInputChange}
                        placeholder="Nom de la fonctionnalité concernée"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="moduleImpacte">
                        Module impacté <span className="required">*</span>
                      </label>
                      <select
                        id="moduleImpacte"
                        name="moduleImpacte"
                        value={formData.moduleImpacte}
                        onChange={handleInputChange}
                        required
                      >
                        {modulesDisponibles.map((module) => (
                          <option key={module} value={module}>
                            {module}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="severite">
                        Sévérité <span className="required">*</span>
                      </label>
                      <select
                        id="severite"
                        name="severite"
                        value={formData.severite}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Bloquant">Bloquant</option>
                        <option value="Majeur">Majeur</option>
                        <option value="Mineur">Mineur</option>
                      </select>
                      <span className="hint">Le GP validera la sévérité</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="priorite">
                        Priorité
                      </label>
                      <select
                        id="priorite"
                        name="priorite"
                        value={formData.priorite}
                        onChange={handleInputChange}
                      >
                        <option value="Haute">Haute</option>
                        <option value="Moyenne">Moyenne</option>
                        <option value="Basse">Basse</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="captureEcran">
                        Capture d'écran (optionnel)
                      </label>
                      <input
                        type="file"
                        id="captureEcran"
                        name="captureEcran"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {formData.captureEcran && (
                        <div style={{ marginTop: "8px" }}>
                          <img 
                            src={formData.captureEcran} 
                            alt="Aperçu" 
                            style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }}
                          />
                        </div>
                      )}
                    </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={handleCancel}>
                      Annuler
                    </button>
                    <button type="submit" className="btn-primary">
                      Déclarer le bug
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des bugs déclarés</h3>
            {bugs.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucun bug déclaré pour le moment.
              </p>
            ) : (
              <table className="data-table" style={{ marginTop: "16px" }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date de création</th>
                    <th>Déclarant</th>
                    <th>Description courte</th>
                    <th>Module impacté</th>
                    <th>Sévérité</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {bugs.map((bug) => (
                    <tr key={bug.id}>
                      <td>{bug.id}</td>
                      <td>{formatDate(bug.dateCreation)}</td>
                      <td>{bug.declarant}</td>
                      <td>{bug.descriptionCourte}</td>
                      <td>{bug.moduleImpacte}</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: getSeveriteColor(bug.severite) + "20",
                            color: getSeveriteColor(bug.severite),
                            fontWeight: "500",
                            fontSize: "12px"
                          }}
                        >
                          {bug.severite}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: getPrioriteColor(bug.priorite) + "20",
                            color: getPrioriteColor(bug.priorite),
                            fontWeight: "500",
                            fontSize: "12px"
                          }}
                        >
                          {bug.priorite}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: "#4A90E220",
                            color: "#4A90E2",
                            fontWeight: "500",
                            fontSize: "12px"
                          }}
                        >
                          {bug.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ),
    },
    "suivi-resolution-cloture": {
      title: "Suivi Résolution Clôture",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary">
              Suivre la résolution d'un bug
            </button>
          </div>

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Suivi des résolutions</h3>
            <p style={{ color: "#6b7280", marginTop: "16px" }}>
              Fonctionnalité en cours de développement...
            </p>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{subPages[activeSubPage].title}</h1>
        <p>Gérez la déclaration, qualification et suivi des bugs</p>
      </div>

      <div className="page-content">
        {subPages[activeSubPage].content}
      </div>
    </div>
  );
};

export default Bugs;
