import { useState, useEffect, useCallback } from "react";
import "./PageStyles.css";
import {
  chargerRessources,
  creerRessource,
  mettreAJourRessource,
  supprimerRessource,
} from "../../data/gestionRessources";
import {
  chargerDelais,
  creerDelai,
  mettreAJourDelai,
  supprimerDelai,
  getDelaisEnRetard,
} from "../../data/gestionDelaisPlanCharge";
import {
  chargerCouts,
  creerCout,
  mettreAJourCout,
  supprimerCout,
  getStatistiquesCouts,
} from "../../data/gestionCoutsProduit";

const PlanChargeEquipes = ({ activeSubPage: activeSubPageProp, selectedDelaiId }) => {
  const [activeSubPage, setActiveSubPage] = useState("saisie-ressources");

  // États pour la gestion des ressources
  const [ressources, setRessources] = useState([]);
  const [showRessourceForm, setShowRessourceForm] = useState(false);
  const [editingRessource, setEditingRessource] = useState(null);
  const [ressourceFormData, setRessourceFormData] = useState({
    nom: "",
    type: "",
    disponibiliteHJ: "",
    tauxJournalier: "",
    actif: true,
  });
  const [ressourceMessage, setRessourceMessage] = useState({ type: "", text: "" });
  const [showRessourceDeleteConfirm, setShowRessourceDeleteConfirm] = useState(false);
  const [ressourceToDelete, setRessourceToDelete] = useState(null);

  // États pour la gestion des délais
  const [delais, setDelais] = useState([]);
  const [showDelaiForm, setShowDelaiForm] = useState(false);
  const [editingDelai, setEditingDelai] = useState(null);
  const [delaiFormData, setDelaiFormData] = useState({
    dateValidationSI: "",
    dateReponseDEV: "",
    dateReponseTIV: "",
  });
  const [delaiMessage, setDelaiMessage] = useState({ type: "", text: "" });
  const [showDelaiDeleteConfirm, setShowDelaiDeleteConfirm] = useState(false);
  const [delaiToDelete, setDelaiToDelete] = useState(null);

  // États pour la gestion des coûts
  const [couts, setCouts] = useState([]);
  const [showCoutForm, setShowCoutForm] = useState(false);
  const [editingCout, setEditingCout] = useState(null);
  const [coutFormData, setCoutFormData] = useState({
    chargePrevisionnelleDEV: "",
    chargeEffectiveDEV: "",
    tjmDEV: "",
    chargePrevisionnelleTIV: "",
    chargeEffectiveTIV: "",
    tjmTIV: "",
  });
  const [coutMessage, setCoutMessage] = useState({ type: "", text: "" });
  const [showCoutDeleteConfirm, setShowCoutDeleteConfirm] = useState(false);
  const [coutToDelete, setCoutToDelete] = useState(null);
  const [activeCoutTab, setActiveCoutTab] = useState("budget-dev");

  const chargerLesRessources = useCallback(() => {
    const ressourcesChargees = chargerRessources();
    setRessources(ressourcesChargees);
  }, []);

  useEffect(() => {
    if (activeSubPageProp) {
      // Extraire le type de sous-page depuis le path
      // Vérifier les cas les plus spécifiques d'abord
      if (activeSubPageProp.includes("cout") || activeSubPageProp.includes("produit"))
        setActiveSubPage("cout-produit");
      else if (activeSubPageProp.includes("saisie") || activeSubPageProp.includes("ressources"))
        setActiveSubPage("saisie-ressources");
      else if (activeSubPageProp.includes("delai"))
        setActiveSubPage("delai-plan-charge");
      else if (activeSubPageProp.includes("plan-charge"))
        setActiveSubPage("delai-plan-charge");
    }
  }, [activeSubPageProp]);

  const chargerLesDelais = useCallback(() => {
    const delaisCharges = chargerDelais();
    setDelais(delaisCharges);
  }, []);

  const chargerLesCouts = useCallback(() => {
    const coutsCharges = chargerCouts();
    setCouts(coutsCharges);
  }, []);

  // Charger les données selon la sous-page active
  useEffect(() => {
    if (activeSubPage === "saisie-ressources") {
      chargerLesRessources();
    } else if (activeSubPage === "delai-plan-charge") {
      chargerLesDelais();
    } else if (activeSubPage === "cout-produit") {
      chargerLesCouts();
    }
  }, [activeSubPage, chargerLesRessources, chargerLesDelais, chargerLesCouts]);

  // Gestion de la navigation vers un délai spécifique depuis les notifications
  useEffect(() => {
    if (selectedDelaiId && activeSubPage === "plan-charge-delai-plan-charge") {
      const delai = delais.find(d => d.id === selectedDelaiId);
      if (delai) {
        handleEditDelai(delai);
      }
    }
  }, [selectedDelaiId, activeSubPage, delais]);

  // Fonctions pour la gestion des ressources
  const handleRessourceInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRessourceFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (ressourceMessage.text) {
      setRessourceMessage({ type: "", text: "" });
    }
  };

  const handleCreateRessource = () => {
    setEditingRessource(null);
    setRessourceFormData({
      nom: "",
      type: "",
      disponibiliteHJ: "",
      tauxJournalier: "",
      actif: true,
    });
    setShowRessourceForm(true);
    setRessourceMessage({ type: "", text: "" });
  };

  const handleEditRessource = (ressource) => {
    setEditingRessource(ressource);
    setRessourceFormData({
      nom: ressource.nom,
      type: ressource.type,
      disponibiliteHJ: ressource.disponibiliteHJ.toString(),
      tauxJournalier: ressource.tauxJournalier.toString(),
      actif: ressource.actif,
    });
    setShowRessourceForm(true);
    setRessourceMessage({ type: "", text: "" });
  };

  const handleDeleteRessource = (ressource) => {
    setRessourceToDelete(ressource);
    setShowRessourceDeleteConfirm(true);
  };

  const confirmDeleteRessource = () => {
    if (ressourceToDelete) {
      const resultat = supprimerRessource(ressourceToDelete.id);
      if (resultat.succes) {
        setRessourceMessage({ type: "success", text: resultat.message });
        chargerLesRessources();
        setTimeout(() => setRessourceMessage({ type: "", text: "" }), 3000);
      } else {
        setRessourceMessage({ type: "error", text: resultat.message });
        setTimeout(() => setRessourceMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowRessourceDeleteConfirm(false);
    setRessourceToDelete(null);
  };

  const cancelDeleteRessource = () => {
    setShowRessourceDeleteConfirm(false);
    setRessourceToDelete(null);
  };

  const handleRessourceSubmit = (e) => {
    e.preventDefault();
    setRessourceMessage({ type: "", text: "" });

    let resultat;
    if (editingRessource) {
      resultat = mettreAJourRessource(editingRessource.id, ressourceFormData);
    } else {
      resultat = creerRessource(ressourceFormData);
    }

    if (resultat.succes) {
      setRessourceMessage({ type: "success", text: resultat.message });
      chargerLesRessources();
      setShowRessourceForm(false);
      setRessourceFormData({
        nom: "",
        type: "",
        disponibiliteHJ: "",
        tauxJournalier: "",
        actif: true,
      });
      setEditingRessource(null);
      setTimeout(() => setRessourceMessage({ type: "", text: "" }), 3000);
    } else {
      setRessourceMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelRessource = () => {
    setShowRessourceForm(false);
    setRessourceFormData({
      nom: "",
      type: "",
      disponibiliteHJ: "",
      tauxJournalier: "",
      actif: true,
    });
    setEditingRessource(null);
    setRessourceMessage({ type: "", text: "" });
  };

  // Fonctions pour la gestion des délais
  const handleDelaiInputChange = (e) => {
    const { name, value } = e.target;
    setDelaiFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (delaiMessage.text) {
      setDelaiMessage({ type: "", text: "" });
    }
  };

  const handleCreateDelai = () => {
    setEditingDelai(null);
    setDelaiFormData({
      dateValidationSI: "",
      dateReponseDEV: "",
      dateReponseTIV: "",
    });
    setShowDelaiForm(true);
    setDelaiMessage({ type: "", text: "" });
  };

  const handleEditDelai = (delai) => {
    setEditingDelai(delai);
    setDelaiFormData({
      dateValidationSI: delai.dateValidationSI,
      dateReponseDEV: delai.dateReponseDEV || "",
      dateReponseTIV: delai.dateReponseTIV || "",
    });
    setShowDelaiForm(true);
    setDelaiMessage({ type: "", text: "" });
  };

  const handleDeleteDelai = (delai) => {
    setDelaiToDelete(delai);
    setShowDelaiDeleteConfirm(true);
  };

  const confirmDeleteDelai = () => {
    if (delaiToDelete) {
      const resultat = supprimerDelai(delaiToDelete.id);
      if (resultat.succes) {
        setDelaiMessage({ type: "success", text: resultat.message });
        chargerLesDelais();
        setTimeout(() => setDelaiMessage({ type: "", text: "" }), 3000);
      } else {
        setDelaiMessage({ type: "error", text: resultat.message });
        setTimeout(() => setDelaiMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowDelaiDeleteConfirm(false);
    setDelaiToDelete(null);
  };

  const cancelDeleteDelai = () => {
    setShowDelaiDeleteConfirm(false);
    setDelaiToDelete(null);
  };

  const handleDelaiSubmit = (e) => {
    e.preventDefault();
    setDelaiMessage({ type: "", text: "" });

    // Validation
    if (!delaiFormData.dateValidationSI) {
      setDelaiMessage({ type: "error", text: "La date de validation SI est obligatoire." });
      return;
    }

    let resultat;
    if (editingDelai) {
      resultat = mettreAJourDelai(editingDelai.id, delaiFormData);
    } else {
      resultat = creerDelai(delaiFormData);
    }

    if (resultat.succes) {
      setDelaiMessage({ type: "success", text: resultat.message });
      chargerLesDelais();
      setShowDelaiForm(false);
      setDelaiFormData({
        dateValidationSI: "",
        dateReponseDEV: "",
        dateReponseTIV: "",
      });
      setEditingDelai(null);
      setTimeout(() => setDelaiMessage({ type: "", text: "" }), 3000);
    } else {
      setDelaiMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelDelai = () => {
    setShowDelaiForm(false);
    setDelaiFormData({
      dateValidationSI: "",
      dateReponseDEV: "",
      dateReponseTIV: "",
    });
    setEditingDelai(null);
    setDelaiMessage({ type: "", text: "" });
  };

  // Fonctions pour la gestion des coûts
  const handleCoutInputChange = (e) => {
    const { name, value } = e.target;
    setCoutFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (coutMessage.text) {
      setCoutMessage({ type: "", text: "" });
    }
  };

  const handleCreateCout = () => {
    setEditingCout(null);
    setCoutFormData({
      chargePrevisionnelleDEV: "",
      chargeEffectiveDEV: "",
      tjmDEV: "",
      chargePrevisionnelleTIV: "",
      chargeEffectiveTIV: "",
      tjmTIV: "",
    });
    setShowCoutForm(true);
    setCoutMessage({ type: "", text: "" });
  };

  const handleEditCout = (cout) => {
    setEditingCout(cout);
    setCoutFormData({
      chargePrevisionnelleDEV: cout.chargePrevisionnelleDEV.toString(),
      chargeEffectiveDEV: cout.chargeEffectiveDEV.toString(),
      tjmDEV: cout.tjmDEV.toString(),
      chargePrevisionnelleTIV: cout.chargePrevisionnelleTIV.toString(),
      chargeEffectiveTIV: cout.chargeEffectiveTIV.toString(),
      tjmTIV: cout.tjmTIV.toString(),
    });
    setShowCoutForm(true);
    setCoutMessage({ type: "", text: "" });
  };

  const handleDeleteCout = (cout) => {
    setCoutToDelete(cout);
    setShowCoutDeleteConfirm(true);
  };

  const confirmDeleteCout = () => {
    if (coutToDelete) {
      const resultat = supprimerCout(coutToDelete.id);
      if (resultat.succes) {
        setCoutMessage({ type: "success", text: resultat.message });
        chargerLesCouts();
        setTimeout(() => setCoutMessage({ type: "", text: "" }), 3000);
      } else {
        setCoutMessage({ type: "error", text: resultat.message });
        setTimeout(() => setCoutMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowCoutDeleteConfirm(false);
    setCoutToDelete(null);
  };

  const cancelDeleteCout = () => {
    setShowCoutDeleteConfirm(false);
    setCoutToDelete(null);
  };

  const handleCoutSubmit = (e) => {
    e.preventDefault();
    setCoutMessage({ type: "", text: "" });

    let resultat;
    if (editingCout) {
      resultat = mettreAJourCout(editingCout.id, coutFormData);
    } else {
      resultat = creerCout(coutFormData);
    }

    if (resultat.succes) {
      setCoutMessage({ type: "success", text: resultat.message });
      chargerLesCouts();
      setShowCoutForm(false);
      setCoutFormData({
        chargePrevisionnelleDEV: "",
        chargeEffectiveDEV: "",
        tjmDEV: "",
        chargePrevisionnelleTIV: "",
        chargeEffectiveTIV: "",
        tjmTIV: "",
      });
      setEditingCout(null);
      setTimeout(() => setCoutMessage({ type: "", text: "" }), 3000);
    } else {
      setCoutMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelCout = () => {
    setShowCoutForm(false);
    setCoutFormData({
      chargePrevisionnelleDEV: "",
      chargeEffectiveDEV: "",
      tjmDEV: "",
      chargePrevisionnelleTIV: "",
      chargeEffectiveTIV: "",
      tjmTIV: "",
    });
    setEditingCout(null);
    setCoutMessage({ type: "", text: "" });
  };

  const subPages = {
    "saisie-ressources": {
      title: "Saisie des Ressources DEV et TIV",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateRessource}>
              Ajouter une ressource
            </button>
          </div>

          {ressourceMessage.text && (
            <div
              className={`info-box ${
                ressourceMessage.type === "error" ? "error-box" : "success-box"
              }`}
              style={{
                marginTop: "16px",
                backgroundColor:
                  ressourceMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                borderColor:
                  ressourceMessage.type === "error" ? "#fecaca" : "#a7f3d0",
                color:
                  ressourceMessage.type === "error" ? "#991b1b" : "#065f46",
              }}
            >
              <p>{ressourceMessage.text}</p>
            </div>
          )}

          {showRessourceForm && (
            <div className="modal-overlay" onClick={handleCancelRessource}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "600px" }}
              >
                <div className="modal-header">
                  <h3>
                    {editingRessource
                      ? "Modifier la ressource"
                      : "Ajouter une nouvelle ressource"}
                  </h3>
                  <button
                    className="modal-close"
                    onClick={handleCancelRessource}
                  >
                    &times;
                  </button>
                </div>
                <form onSubmit={handleRessourceSubmit}>
                  <div className="form-group">
                    <label htmlFor="ressourceId">
                      Identifiant de la ressource
                    </label>
                    <input
                      type="text"
                      id="ressourceId"
                      value={
                        editingRessource
                          ? editingRessource.id
                          : "Généré automatiquement"
                      }
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ressourceNom">
                      Nom de la ressource <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="ressourceNom"
                      name="nom"
                      value={ressourceFormData.nom}
                      onChange={handleRessourceInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ressourceType">
                      Type de ressource <span className="required">*</span>
                    </label>
                    <select
                      id="ressourceType"
                      name="type"
                      value={ressourceFormData.type}
                      onChange={handleRessourceInputChange}
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="DEV">DEV</option>
                      <option value="TIV">TIV</option>
                    </select>
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Une ressource doit obligatoirement être typée DEV ou TIV
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ressourceDisponibilite">
                      Disponibilité (H/J) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="ressourceDisponibilite"
                      name="disponibiliteHJ"
                      value={ressourceFormData.disponibiliteHJ}
                      onChange={handleRessourceInputChange}
                      min="0"
                      step="0.5"
                      required
                    />
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Homme/Jour
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ressourceTJM">
                      Taux journalier (TJM) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="ressourceTJM"
                      name="tauxJournalier"
                      value={ressourceFormData.tauxJournalier}
                      onChange={handleRessourceInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      FCFA
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="actif"
                        checked={ressourceFormData.actif}
                        onChange={handleRessourceInputChange}
                      />
                      <span>Actif</span>
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingRessource ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelRessource}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des ressources</h3>
            {ressources.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucune ressource créée pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Disponibilité (H/J)</th>
                    <th>TJM (FCFA)</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ressources.map((ressource) => (
                    <tr key={ressource.id}>
                      <td>{ressource.id}</td>
                      <td>{ressource.nom}</td>
                      <td>
                        <span
                          className={`badge ${
                            ressource.type === "DEV"
                              ? "badge-success"
                              : "badge-primary"
                          }`}
                        >
                          {ressource.type}
                        </span>
                      </td>
                      <td>{ressource.disponibiliteHJ}</td>
                      <td>{ressource.tauxJournalier}FCFA</td>
                      <td>{ressource.actif ? "Actif" : "Non actif"}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => handleEditRessource(ressource)}
                          style={{ marginRight: "5px" }}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteRessource(ressource)}
                        >
                          Supprimer
                        </button>
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
    "delai-plan-charge": {
      title: "Délai Plan de Charge",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateDelai}>
              Ajouter un suivi de délai
            </button>
          </div>

          {delaiMessage.text && (
            <div
              className={`info-box ${
                delaiMessage.type === "error" ? "error-box" : "success-box"
              }`}
              style={{
                marginTop: "16px",
                backgroundColor:
                  delaiMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                borderColor:
                  delaiMessage.type === "error" ? "#fecaca" : "#a7f3d0",
                color:
                  delaiMessage.type === "error" ? "#991b1b" : "#065f46",
              }}
            >
              <p>{delaiMessage.text}</p>
            </div>
          )}

          {showDelaiForm && (
            <div className="modal-overlay" onClick={handleCancelDelai}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "600px" }}
              >
                <div className="modal-header">
                  <h3>
                    {editingDelai
                      ? "Modifier le suivi de délai"
                      : "Ajouter un suivi de délai"}
                  </h3>
                  <button
                    className="modal-close"
                    onClick={handleCancelDelai}
                  >
                    &times;
                  </button>
                </div>
                <form onSubmit={handleDelaiSubmit}>
                  <div className="form-group">
                    <label htmlFor="delaiId">
                      Identifiant du suivi
                    </label>
                    <input
                      type="text"
                      id="delaiId"
                      value={
                        editingDelai
                          ? editingDelai.id
                          : "Généré automatiquement"
                      }
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateValidationSI">
                      Date de validation SI <span className="required">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="dateValidationSI"
                      name="dateValidationSI"
                      value={delaiFormData.dateValidationSI}
                      onChange={handleDelaiInputChange}
                      required
                    />
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Le délai de réponse est imparti de 48 h ouvrées après la validation de SI
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateReponseDEV">
                      Date de réponse DEV
                    </label>
                    <input
                      type="datetime-local"
                      id="dateReponseDEV"
                      name="dateReponseDEV"
                      value={delaiFormData.dateReponseDEV}
                      onChange={handleDelaiInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateReponseTIV">
                      Date de réponse TIV
                    </label>
                    <input
                      type="datetime-local"
                      id="dateReponseTIV"
                      name="dateReponseTIV"
                      value={delaiFormData.dateReponseTIV}
                      onChange={handleDelaiInputChange}
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingDelai ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelDelai}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Suivi des délais de réponse</h3>
            {delais.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucun suivi de délai créé pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date validation SI</th>
                    <th>Date réponse DEV</th>
                    <th>Délai DEV (h)</th>
                    <th>Respect délai DEV</th>
                    <th>Date réponse TIV</th>
                    <th>Délai TIV (h)</th>
                    <th>Respect délai TIV</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {delais.map((delai) => (
                    <tr key={delai.id}>
                      <td>{delai.id}</td>
                      <td>
                        {new Date(delai.dateValidationSI).toLocaleString()}
                      </td>
                      <td>
                        {delai.dateReponseDEV
                          ? new Date(delai.dateReponseDEV).toLocaleString()
                          : "-"}
                      </td>
                      <td>{delai.dateReponseDEV ? delai.delaiDEV : "-"}</td>
                      <td>
                        {delai.dateReponseDEV ? (
                          <span
                            className={`badge ${
                              delai.respectDelaiDEV
                                ? "badge-success"
                                : "badge-danger"
                            }`}
                          >
                            {delai.respectDelaiDEV ? "✓ Respecté" : "✗ Dépassé"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {delai.dateReponseTIV
                          ? new Date(delai.dateReponseTIV).toLocaleString()
                          : "-"}
                      </td>
                      <td>{delai.dateReponseTIV ? delai.delaiTIV : "-"}</td>
                      <td>
                        {delai.dateReponseTIV ? (
                          <span
                            className={`badge ${
                              delai.respectDelaiTIV
                                ? "badge-success"
                                : "badge-danger"
                            }`}
                          >
                            {delai.respectDelaiTIV ? "✓ Respecté" : "✗ Dépassé"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => handleEditDelai(delai)}
                          style={{ marginRight: "5px" }}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteDelai(delai)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section des délais en retard */}
          {(() => {
            const delaisEnRetard = getDelaisEnRetard();
            return delaisEnRetard.length > 0 ? (
              <div className="table-container" style={{ marginTop: "48px" }}>
                <h3 style={{ color: "#dc2626" }}>
                  ⚠️ Délais en retard ({delaisEnRetard.length})
                </h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date validation SI</th>
                      <th>Délai dépassé pour</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delaisEnRetard.map((delai) => (
                      <tr key={delai.id}>
                        <td>{delai.id}</td>
                        <td>
                          {new Date(delai.dateValidationSI).toLocaleString()}
                        </td>
                        <td>
                          {(() => {
                            const maintenant = new Date();
                            const delaiDEV = delai.dateReponseDEV
                              ? 0
                              : Math.floor(
                                  (maintenant - new Date(delai.dateValidationSI)) /
                                    (1000 * 60 * 60)
                                );
                            const delaiTIV = delai.dateReponseTIV
                              ? 0
                              : Math.floor(
                                  (maintenant - new Date(delai.dateValidationSI)) /
                                    (1000 * 60 * 60)
                                );

                            const retards = [];
                            if (delaiDEV > 48) retards.push("DEV");
                            if (delaiTIV > 48) retards.push("TIV");

                            return retards.join(", ");
                          })()}
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            onClick={() => handleEditDelai(delai)}
                          >
                            Mettre à jour
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null;
          })()}
        </div>
      ),
    },
    "cout-produit": {
      title: "Coût du Produit",
      content: (
        <div>
          <div className="action-buttons" style={{ marginBottom: "24px" }}>
            <button className="btn-primary" onClick={handleCreateCout}>
              Ajouter un suivi de coût
            </button>
          </div>

          {coutMessage.text && (
            <div
              className={`info-box ${
                coutMessage.type === "error" ? "error-box" : "success-box"
              }`}
              style={{
                marginBottom: "24px",
                backgroundColor:
                  coutMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                borderColor:
                  coutMessage.type === "error" ? "#fecaca" : "#a7f3d0",
                color:
                  coutMessage.type === "error" ? "#991b1b" : "#065f46",
              }}
            >
              <p>{coutMessage.text}</p>
            </div>
          )}

          {/* Onglets pour les différentes fonctionnalités */}
          <div className="tab-navigation" style={{ marginBottom: "24px" }}>
            <button
              className={`tab-button ${
                activeCoutTab === "budget-dev" ? "active" : ""
              }`}
              onClick={() => setActiveCoutTab("budget-dev")}
            >
              📊 Calcul budgétaire dynamique DEV
            </button>
            <button
              className={`tab-button ${
                activeCoutTab === "budget-tiv" ? "active" : ""
              }`}
              onClick={() => setActiveCoutTab("budget-tiv")}
            >
              📈 Calcul budgétaire dynamique TIV
            </button>
            <button
              className={`tab-button ${
                activeCoutTab === "net-payer" ? "active" : ""
              }`}
              onClick={() => setActiveCoutTab("net-payer")}
            >
              💰 Calcul net à payer
            </button>
            <button
              className={`tab-button ${
                activeCoutTab === "ecart-budgetaire" ? "active" : ""
              }`}
              onClick={() => setActiveCoutTab("ecart-budgetaire")}
            >
              ⚖️ Écart budgétaire
            </button>
          </div>

          {/* Contenu selon l'onglet actif */}
          {activeCoutTab === "budget-dev" && (
            <div className="section-rubrique">
              <div className="section-header">
                <h2>Calcul budgétaire dynamique DEV</h2>
                <p className="section-description">
                  Le système calcule automatiquement le coût DEV à partir de la charge fournis par les DEV.
                  <br />
                  <strong>Formules :</strong> Coût prévu DEV = Charge prévisionnelle DEV × TJM DEV | Coût réel DEV = Charge effective DEV × TJM DEV
                </p>
              </div>

              <div className="action-buttons" style={{ marginBottom: "24px" }}>
                <button className="btn-primary" onClick={handleCreateCout}>
                  Ajouter un suivi de coût DEV
                </button>
              </div>

              {coutMessage.text && (
                <div
                  className={`info-box ${
                    coutMessage.type === "error" ? "error-box" : "success-box"
                  }`}
                  style={{
                    marginBottom: "24px",
                    backgroundColor:
                      coutMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                    borderColor:
                      coutMessage.type === "error" ? "#fecaca" : "#a7f3d0",
                    color:
                      coutMessage.type === "error" ? "#991b1b" : "#065f46",
                  }}
                >
                  <p>{coutMessage.text}</p>
                </div>
              )}

              {couts.length === 0 ? (
                <div className="empty-state">
                  <p>📊 Aucun suivi de coût DEV créé pour le moment.</p>
                  <p>Cliquez sur "Ajouter un suivi de coût DEV" pour commencer.</p>
                </div>
              ) : (
                <div className="budget-table-container">
                  <table className="data-table budget-table">
                    <thead>
                      <tr>
                        <th>ID Projet</th>
                        <th>Charge prévisionnelle DEV</th>
                        <th>Charge effective DEV</th>
                        <th>TJM DEV</th>
                        <th>Coût prévu DEV</th>
                        <th>Coût réel DEV</th>
                        <th>État du projet</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couts.map((cout) => (
                        <tr key={cout.id}>
                          <td>
                            <span className="project-id">#{cout.id}</span>
                          </td>
                          <td>
                            <div className="charge-display">
                              <span className="charge-value">{cout.chargePrevisionnelleDEV}</span>
                              <span className="charge-unit">H/J</span>
                            </div>
                          </td>
                          <td>
                            <div className="charge-display">
                              <span className="charge-value">{cout.chargeEffectiveDEV}</span>
                              <span className="charge-unit">H/J</span>
                            </div>
                          </td>
                          <td>
                            <div className="cost-display">
                              <span className="cost-value">{cout.tjmDEV}</span>
                              <span className="cost-unit">FCFA/J</span>
                            </div>
                          </td>
                          <td>
                            <div className="total-cost-display predicted">
                              <span className="cost-value">{cout.coutPrevuDEV.toLocaleString()}</span>
                              <span className="cost-unit">FCFA</span>
                            </div>
                          </td>
                          <td>
                            <div className="total-cost-display actual">
                              <span className="cost-value">{cout.coutReelDEV.toLocaleString()}</span>
                              <span className="cost-unit">FCFA</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${
                              cout.chargeEffectiveDEV > cout.chargePrevisionnelleDEV
                                ? 'status-over'
                                : cout.chargeEffectiveDEV < cout.chargePrevisionnelleDEV
                                ? 'status-under'
                                : 'status-equal'
                            }`}>
                              {cout.chargeEffectiveDEV > cout.chargePrevisionnelleDEV
                                ? 'Dépassement'
                                : cout.chargeEffectiveDEV < cout.chargePrevisionnelleDEV
                                ? 'Économie'
                                : 'Conforme'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-secondary"
                                onClick={() => handleEditCout(cout)}
                                title="Modifier ce suivi de coût"
                              >
                                ✏️ Modifier
                              </button>
                              <button
                                className="btn-danger"
                                onClick={() => handleDeleteCout(cout)}
                                title="Supprimer ce suivi de coût"
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Résumé DEV */}
                  <div className="budget-summary">
                    <h3>Résumé des coûts DEV</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-label">Total coût prévu DEV :</span>
                        <span className="summary-value predicted">
                          {couts.reduce((sum, c) => sum + c.coutPrevuDEV, 0).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Total coût réel DEV :</span>
                        <span className="summary-value actual">
                          {couts.reduce((sum, c) => sum + c.coutReelDEV, 0).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Écart total DEV :</span>
                        <span className={`summary-value ${
                          couts.reduce((sum, c) => sum + c.coutReelDEV, 0) - couts.reduce((sum, c) => sum + c.coutPrevuDEV, 0) > 0
                            ? 'over'
                            : couts.reduce((sum, c) => sum + c.coutReelDEV, 0) - couts.reduce((sum, c) => sum + c.coutPrevuDEV, 0) < 0
                            ? 'under'
                            : 'equal'
                        }`}>
                          {(couts.reduce((sum, c) => sum + c.coutReelDEV, 0) - couts.reduce((sum, c) => sum + c.coutPrevuDEV, 0)).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCoutTab === "budget-tiv" && (
            <div className="section-rubrique">
              <div className="section-header">
                <h2>Calcul budgétaire dynamique TIV</h2>
                <p className="section-description">
                  Le système calcule automatiquement le coût TIV à partir de la charge fournis par les TIV.
                  <br />
                  <strong>Formules :</strong> Coût prévu TIV = Charge prévisionnelle TIV × TJM TIV | Coût réel TIV = Charge effective TIV × TJM TIV
                </p>
              </div>

              <div className="action-buttons" style={{ marginBottom: "24px" }}>
                <button className="btn-primary" onClick={handleCreateCout}>
                  Ajouter un suivi de coût TIV
                </button>
              </div>

              {coutMessage.text && (
                <div
                  className={`info-box ${
                    coutMessage.type === "error" ? "error-box" : "success-box"
                  }`}
                  style={{
                    marginBottom: "24px",
                    backgroundColor:
                      coutMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                    borderColor:
                      coutMessage.type === "error" ? "#fecaca" : "#a7f3d0",
                    color:
                      coutMessage.type === "error" ? "#991b1b" : "#065f46",
                  }}
                >
                  <p>{coutMessage.text}</p>
                </div>
              )}

              {couts.length === 0 ? (
                <div className="empty-state">
                  <p>📈 Aucun suivi de coût TIV créé pour le moment.</p>
                  <p>Cliquez sur "Ajouter un suivi de coût TIV" pour commencer.</p>
                </div>
              ) : (
                <div className="budget-table-container">
                  <table className="data-table budget-table">
                    <thead>
                      <tr>
                        <th>ID Projet</th>
                        <th>Charge prévisionnelle TIV</th>
                        <th>Charge effective TIV</th>
                        <th>TJM TIV</th>
                        <th>Coût prévu TIV</th>
                        <th>Coût réel TIV</th>
                        <th>État du projet</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couts.map((cout) => (
                        <tr key={cout.id}>
                          <td>
                            <span className="project-id">#{cout.id}</span>
                          </td>
                          <td>
                            <div className="charge-display">
                              <span className="charge-value">{cout.chargePrevisionnelleTIV}</span>
                              <span className="charge-unit">H/J</span>
                            </div>
                          </td>
                          <td>
                            <div className="charge-display">
                              <span className="charge-value">{cout.chargeEffectiveTIV}</span>
                              <span className="charge-unit">H/J</span>
                            </div>
                          </td>
                          <td>
                            <div className="cost-display">
                              <span className="cost-value">{cout.tjmTIV}</span>
                              <span className="cost-unit">FCFA/J</span>
                            </div>
                          </td>
                          <td>
                            <div className="total-cost-display predicted">
                              <span className="cost-value">{cout.coutPrevuTIV.toLocaleString()}</span>
                              <span className="cost-unit">FCFA</span>
                            </div>
                          </td>
                          <td>
                            <div className="total-cost-display actual">
                              <span className="cost-value">{cout.coutReelTIV.toLocaleString()}</span>
                              <span className="cost-unit">FCFA</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${
                              cout.chargeEffectiveTIV > cout.chargePrevisionnelleTIV
                                ? 'status-over'
                                : cout.chargeEffectiveTIV < cout.chargePrevisionnelleTIV
                                ? 'status-under'
                                : 'status-equal'
                            }`}>
                              {cout.chargeEffectiveTIV > cout.chargePrevisionnelleTIV
                                ? 'Dépassement'
                                : cout.chargeEffectiveTIV < cout.chargePrevisionnelleTIV
                                ? 'Économie'
                                : 'Conforme'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-secondary"
                                onClick={() => handleEditCout(cout)}
                                title="Modifier ce suivi de coût"
                              >
                                ✏️ Modifier
                              </button>
                              <button
                                className="btn-danger"
                                onClick={() => handleDeleteCout(cout)}
                                title="Supprimer ce suivi de coût"
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Résumé TIV */}
                  <div className="budget-summary">
                    <h3>Résumé des coûts TIV</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-label">Total coût prévu TIV :</span>
                        <span className="summary-value predicted">
                          {couts.reduce((sum, c) => sum + c.coutPrevuTIV, 0).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Total coût réel TIV :</span>
                        <span className="summary-value actual">
                          {couts.reduce((sum, c) => sum + c.coutReelTIV, 0).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Écart total TIV :</span>
                        <span className={`summary-value ${
                          couts.reduce((sum, c) => sum + c.coutReelTIV, 0) - couts.reduce((sum, c) => sum + c.coutPrevuTIV, 0) > 0
                            ? 'over'
                            : couts.reduce((sum, c) => sum + c.coutReelTIV, 0) - couts.reduce((sum, c) => sum + c.coutPrevuTIV, 0) < 0
                            ? 'under'
                            : 'equal'
                        }`}>
                          {(couts.reduce((sum, c) => sum + c.coutReelTIV, 0) - couts.reduce((sum, c) => sum + c.coutPrevuTIV, 0)).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCoutTab === "net-payer" && (
            <div className="section-rubrique">
              <div className="section-header">
                <h2>Calcul net à payer</h2>
                <p className="section-description">
                  Le système calcule automatiquement le net à payer afin d'avoir une vision claire du coût total du projet.
                  <br />
                  <strong>Formule :</strong> Net à payer = Coût réel DEV + Coût réel TIV
                  <br />
                  <em>Remarque : Tout changement sur les charges (H/J) ou les taux journaliers (TJM) déclenche un recalcul automatique du coût.</em>
                </p>
              </div>

              {couts.length === 0 ? (
                <div className="empty-state">
                  <p>💰 Aucun suivi de coût créé pour le moment.</p>
                  <p>Cliquez sur "Ajouter un suivi de coût" pour commencer.</p>
                </div>
              ) : (
                <div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID Projet</th>
                        <th>Coût réel DEV</th>
                        <th>Coût réel TIV</th>
                        <th>Coût réel total</th>
                        <th>Net à payer</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couts.map((cout) => (
                        <tr key={cout.id}>
                          <td>
                            <span className="project-id">#{cout.id}</span>
                          </td>
                          <td>
                            <div className="total-cost-display actual">
                              <span className="cost-value">{cout.coutReelDEV.toLocaleString()}</span>
                              <span className="cost-unit">FCFA</span>
                            </div>
                          </td>
                          <td>
                            <div className="total-cost-display actual">
                              <span className="cost-value">{cout.coutReelTIV.toLocaleString()}</span>
                              <span className="cost-unit">FCFA</span>
                            </div>
                          </td>
                          <td>
                            <div className="total-cost-display total">
                              <span className="cost-value">{cout.coutReelTotal.toLocaleString()}</span>
                              <span className="cost-unit">FCFA</span>
                            </div>
                          </td>
                          <td>
                            <div className="total-cost-display net-amount">
                              <span className="cost-value">{cout.netAPayer.toLocaleString()}</span>
                              <span className="cost-unit">FCFA</span>
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-secondary"
                                onClick={() => handleEditCout(cout)}
                                title="Modifier ce suivi de coût"
                              >
                                ✏️ Modifier
                              </button>
                              <button
                                className="btn-danger"
                                onClick={() => handleDeleteCout(cout)}
                                title="Supprimer ce suivi de coût"
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Résumé global */}
                  <div className="budget-summary global-summary">
                    <h3>💰 Résumé global - Net à payer</h3>
                    {(() => {
                      const stats = getStatistiquesCouts();
                      return (
                        <div className="summary-grid">
                          <div className="summary-item">
                            <span className="summary-label">Nombre de projets :</span>
                            <span className="summary-value info">{stats.totalProjets}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Coût total prévu :</span>
                            <span className="summary-value predicted">
                              {stats.coutTotalPrevu.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Coût total réel :</span>
                            <span className="summary-value actual">
                              {stats.coutTotalReel.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Net à payer total :</span>
                            <span className="summary-value net-amount total">
                              {stats.coutTotalReel.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Écart budgétaire total :</span>
                            <span className={`summary-value ${
                              stats.ecartTotal > 0
                                ? 'over'
                                : stats.ecartTotal < 0
                                ? 'under'
                                : 'equal'
                            }`}>
                              {stats.ecartTotal >= 0 ? "+" : ""}{stats.ecartTotal.toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCoutTab === "ecart-budgetaire" && (
            <div className="section-rubrique">
              <div className="section-header">
                <h2>Écart budgétaire</h2>
                <p className="section-description">
                  Consultation de l'écart entre le coût prévu et le coût réel afin d'identifier un dépassement ou une économie.
                  <br />
                  <strong>Formule :</strong> Écart = Coût réel total - Coût prévu total = Coût réel total - (Coût prévu DEV + Coût prévu TIV)
                  <br />
                  <strong>Règles :</strong> Si écart &gt; 0 : dépassement budget &#124; Si écart = 0 : budget respecté &#124; Si écart &lt; 0 : économie
                </p>
              </div>

              {couts.length === 0 ? (
                <div className="empty-state">
                  <p>⚖️ Aucun suivi de coût créé pour le moment.</p>
                  <p>Cliquez sur "Ajouter un suivi de coût" pour commencer.</p>
                </div>
              ) : (
                <div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID Projet</th>
                        <th>Coût prévu DEV</th>
                        <th>Coût prévu TIV</th>
                        <th>Coût prévu total</th>
                        <th>Coût réel DEV</th>
                        <th>Coût réel TIV</th>
                        <th>Coût réel total</th>
                        <th>Écart budgétaire</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couts.map((cout) => {
                        const coutPrevuTotal = cout.coutPrevuDEV + cout.coutPrevuTIV;
                        return (
                          <tr key={cout.id}>
                            <td>
                              <span className="project-id">#{cout.id}</span>
                            </td>
                            <td>
                              <div className="cost-display">
                                <span className="cost-value">{cout.coutPrevuDEV.toLocaleString()}</span>
                                <span className="cost-unit">FCFA</span>
                              </div>
                            </td>
                            <td>
                              <div className="cost-display">
                                <span className="cost-value">{cout.coutPrevuTIV.toLocaleString()}</span>
                                <span className="cost-unit">FCFA</span>
                              </div>
                            </td>
                            <td>
                              <div className="total-cost-display predicted">
                                <span className="cost-value">{coutPrevuTotal.toLocaleString()}</span>
                                <span className="cost-unit">FCFA</span>
                              </div>
                            </td>
                            <td>
                              <div className="cost-display">
                                <span className="cost-value">{cout.coutReelDEV.toLocaleString()}</span>
                                <span className="cost-unit">FCFA</span>
                              </div>
                            </td>
                            <td>
                              <div className="cost-display">
                                <span className="cost-value">{cout.coutReelTIV.toLocaleString()}</span>
                                <span className="cost-unit">FCFA</span>
                              </div>
                            </td>
                            <td>
                              <div className="total-cost-display actual">
                                <span className="cost-value">{cout.coutReelTotal.toLocaleString()}</span>
                                <span className="cost-unit">FCFA</span>
                              </div>
                            </td>
                            <td>
                              <div className={`total-cost-display ecart ${
                                cout.ecart > 0
                                  ? 'over'
                                  : cout.ecart < 0
                                  ? 'under'
                                  : 'equal'
                              }`}>
                                <span className="cost-value">
                                  {cout.ecart >= 0 ? "+" : ""}{cout.ecart.toLocaleString()}
                                </span>
                                <span className="cost-unit">FCFA</span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${
                                cout.ecart > 0
                                  ? "status-over"
                                  : cout.ecart === 0
                                  ? "status-equal"
                                  : "status-under"
                              }`}>
                                {cout.ecart > 0
                                  ? "Dépassement"
                                  : cout.ecart === 0
                                  ? "Budget respecté"
                                  : "Économie"}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-secondary"
                                  onClick={() => handleEditCout(cout)}
                                  title="Modifier ce suivi de coût"
                                >
                                  ✏️ Modifier
                                </button>
                                <button
                                  className="btn-danger"
                                  onClick={() => handleDeleteCout(cout)}
                                  title="Supprimer ce suivi de coût"
                                >
                                  🗑️ Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Résumé des écarts */}
                  <div className="budget-summary">
                    <h3>⚖️ Résumé des écarts budgétaires</h3>
                    {(() => {
                      const stats = getStatistiquesCouts();
                      const projetsEnDeficit = couts.filter(c => c.ecart > 0).length;
                      const projetsEnBenefice = couts.filter(c => c.ecart < 0).length;
                      const projetsEquilibres = couts.filter(c => c.ecart === 0).length;

                      return (
                        <div className="summary-grid">
                          <div className="summary-item">
                            <span className="summary-label">Total projets :</span>
                            <span className="summary-value info">{stats.totalProjets}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Projets en dépassement :</span>
                            <span className="summary-value over">{projetsEnDeficit}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Projets en économie :</span>
                            <span className="summary-value under">{projetsEnBenefice}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Projets équilibrés :</span>
                            <span className="summary-value equal">{projetsEquilibres}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Écart budgétaire total :</span>
                            <span className={`summary-value ${
                              stats.ecartTotal > 0
                                ? 'over'
                                : stats.ecartTotal < 0
                                ? 'under'
                                : 'equal'
                            }`}>
                              {stats.ecartTotal >= 0 ? "+" : ""}{stats.ecartTotal.toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {showCoutForm && (
            <div className="modal-overlay" onClick={handleCancelCout}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "700px" }}
              >
                <div className="modal-header">
                  <h3>
                    {editingCout
                      ? "Modifier le suivi de coût"
                      : "Ajouter un suivi de coût"}
                  </h3>
                  <button
                    className="modal-close"
                    onClick={handleCancelCout}
                  >
                    &times;
                  </button>
                </div>
                <form onSubmit={handleCoutSubmit}>
                  <div className="cout-form-grid">
                    {/* Section DEV */}
                    <div className="form-section">
                      <h4>💻 Développement (DEV)</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="chargePrevisionnelleDEV">
                            Charge prévisionnelle DEV (H/J) <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            id="chargePrevisionnelleDEV"
                            name="chargePrevisionnelleDEV"
                            value={coutFormData.chargePrevisionnelleDEV}
                            onChange={handleCoutInputChange}
                            min="0"
                            step="0.5"
                            required
                            placeholder="0.0"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="chargeEffectiveDEV">
                            Charge effective DEV (H/J) <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            id="chargeEffectiveDEV"
                            name="chargeEffectiveDEV"
                            value={coutFormData.chargeEffectiveDEV}
                            onChange={handleCoutInputChange}
                            min="0"
                            step="0.5"
                            required
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="tjmDEV">
                          TJM DEV (FCFA/jour) <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          id="tjmDEV"
                          name="tjmDEV"
                          value={coutFormData.tjmDEV}
                          onChange={handleCoutInputChange}
                          min="0"
                          step="0.01"
                          required
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Section TIV */}
                    <div className="form-section">
                      <h4>🔧 Interventions (TIV)</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="chargePrevisionnelleTIV">
                            Charge prévisionnelle TIV (H/J) <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            id="chargePrevisionnelleTIV"
                            name="chargePrevisionnelleTIV"
                            value={coutFormData.chargePrevisionnelleTIV}
                            onChange={handleCoutInputChange}
                            min="0"
                            step="0.5"
                            required
                            placeholder="0.0"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="chargeEffectiveTIV">
                            Charge effective TIV (H/J) <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            id="chargeEffectiveTIV"
                            name="chargeEffectiveTIV"
                            value={coutFormData.chargeEffectiveTIV}
                            onChange={handleCoutInputChange}
                            min="0"
                            step="0.5"
                            required
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="tjmTIV">
                          TJM TIV (FCFA/jour) <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          id="tjmTIV"
                          name="tjmTIV"
                          value={coutFormData.tjmTIV}
                          onChange={handleCoutInputChange}
                          min="0"
                          step="0.01"
                          required
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculs automatiques en temps réel */}
                  {coutFormData.chargePrevisionnelleDEV && coutFormData.tjmDEV && (
                    <div className="calculs-preview">
                      <h4>🔄 Aperçu des calculs</h4>
                      <div className="calculs-grid">
                        <div className="calcul-item">
                          <span className="calcul-label">Coût prévu DEV :</span>
                          <span className="calcul-value predicted">
                            {(parseFloat(coutFormData.chargePrevisionnelleDEV || 0) * parseFloat(coutFormData.tjmDEV || 0)).toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="calcul-item">
                          <span className="calcul-label">Coût réel DEV :</span>
                          <span className="calcul-value actual">
                            {(parseFloat(coutFormData.chargeEffectiveDEV || 0) * parseFloat(coutFormData.tjmDEV || 0)).toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="calcul-item">
                          <span className="calcul-label">Coût prévu TIV :</span>
                          <span className="calcul-value predicted">
                            {(parseFloat(coutFormData.chargePrevisionnelleTIV || 0) * parseFloat(coutFormData.tjmTIV || 0)).toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="calcul-item">
                          <span className="calcul-label">Coût réel TIV :</span>
                          <span className="calcul-value actual">
                            {(parseFloat(coutFormData.chargeEffectiveTIV || 0) * parseFloat(coutFormData.tjmTIV || 0)).toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="calcul-item">
                          <span className="calcul-label">Net à payer :</span>
                          <span className="calcul-value net-amount">
                            {((parseFloat(coutFormData.chargeEffectiveDEV || 0) * parseFloat(coutFormData.tjmDEV || 0)) +
                              (parseFloat(coutFormData.chargeEffectiveTIV || 0) * parseFloat(coutFormData.tjmTIV || 0))).toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingCout ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelCout}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ),
    },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{subPages[activeSubPage].title}</h1>
        <p>Gérez le plan de charge des équipes de développement</p>
      </div>

      <div className="page-content">
        {subPages[activeSubPage].content}
      </div>

      {/* Popup de confirmation de suppression de ressource */}
      {showRessourceDeleteConfirm && ressourceToDelete && (
        <div
          className="modal-overlay"
          onClick={cancelDeleteRessource}
        >
          <div
            className="confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer la ressource{" "}
                <strong>"{ressourceToDelete.nom}"</strong> ?
              </p>
              <p className="confirm-warning">
                Cette action est irréversible.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteRessource}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteRessource}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmation de suppression de délai */}
      {showDelaiDeleteConfirm && delaiToDelete && (
        <div
          className="modal-overlay"
          onClick={cancelDeleteDelai}
        >
          <div
            className="confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer ce suivi de délai ?
              </p>
              <p className="confirm-warning">
                Cette action est irréversible.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteDelai}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteDelai}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmation de suppression de coût */}
      {showCoutDeleteConfirm && coutToDelete && (
        <div
          className="modal-overlay"
          onClick={cancelDeleteCout}
        >
          <div
            className="confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer ce suivi de coût ?
              </p>
              <p className="confirm-warning">
                Cette action est irréversible.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteCout}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteCout}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanChargeEquipes;
