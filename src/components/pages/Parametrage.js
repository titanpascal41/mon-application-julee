import { useState, useEffect, useCallback } from "react";
import "./PageStyles.css";
import {
  chargerSocietes,
  creerSociete,
  mettreAJourSociete,
  supprimerSociete,
} from "../../data/societes";
import SocieteInput from "../SocieteInput";
import {
  chargerUO,
  creerUO,
  mettreAJourUO,
  supprimerUO,
  getTypesUO,
} from "../../data/gestionUO";
import {
  chargerStatuts,
  creerStatut,
  mettreAJourStatut,
  supprimerStatut,
} from "../../data/gestionStatuts";
import {
  chargerCollaborateurs,
  creerCollaborateur,
  mettreAJourCollaborateur,
  supprimerCollaborateur,
} from "../../data/gestionCollaborateurs";

const Parametrage = ({ activeSubPage: activeSubPageProp }) => {
  const [activeSubPage, setActiveSubPage] = useState("societes");

  // États pour la gestion des sociétés
  const [societes, setSocietes] = useState([]);
  const [showSocieteForm, setShowSocieteForm] = useState(false);
  const [editingSociete, setEditingSociete] = useState(null);
  const [societeFormData, setSocieteFormData] = useState({
    nom: "",
    adresse: "",
    email: "",
    telephone: "",
    responsable: "",
  });
  const [societeMessage, setSocieteMessage] = useState({ type: "", text: "" });
  const [showSocieteDeleteConfirm, setShowSocieteDeleteConfirm] =
    useState(false);
  const [societeToDelete, setSocieteToDelete] = useState(null);

  // États pour la gestion des UO
  const [uoList, setUOList] = useState([]);
  const [showUOForm, setShowUOForm] = useState(false);
  const [editingUO, setEditingUO] = useState(null);
  const [uoFormData, setUOFormData] = useState({
    nom: "",
    type: "",
    actif: true,
    societeId: "",
  });
  const [uoMessage, setUOMessage] = useState({ type: "", text: "" });
  const [showUODeleteConfirm, setShowUODeleteConfirm] = useState(false);
  const [uoToDelete, setUOToDelete] = useState(null);

  // États pour la gestion des statuts
  const [statuts, setStatuts] = useState([]);
  const [showStatutForm, setShowStatutForm] = useState(false);
  const [editingStatut, setEditingStatut] = useState(null);
  const [statutFormData, setStatutFormData] = useState({
    nom: "",
    description: "",
    actif: true,
  });
  const [statutMessage, setStatutMessage] = useState({ type: "", text: "" });
  const [showStatutDeleteConfirm, setShowStatutDeleteConfirm] = useState(false);
  const [statutToDelete, setStatutToDelete] = useState(null);

  // États pour la gestion des collaborateurs
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [showCollaborateurForm, setShowCollaborateurForm] = useState(false);
  const [editingCollaborateur, setEditingCollaborateur] = useState(null);
  const [collaborateurFormData, setCollaborateurFormData] = useState({
    nom: "",
    email: "",
    poste: "",
    telephone: "",
    actif: true,
  });
  const [collaborateurMessage, setCollaborateurMessage] = useState({
    type: "",
    text: "",
  });
  const [showCollaborateurDeleteConfirm, setShowCollaborateurDeleteConfirm] =
    useState(false);
  const [collaborateurToDelete, setCollaborateurToDelete] = useState(null);

  useEffect(() => {
    if (activeSubPageProp) {
      // Extraire le type de sous-page depuis le path
      if (activeSubPageProp.includes("societes")) setActiveSubPage("societes");
      else if (
        activeSubPageProp.includes("uo") ||
        activeSubPageProp.includes("unites")
      )
        setActiveSubPage("uo");
      else if (activeSubPageProp.includes("statuts"))
        setActiveSubPage("statuts");
      else if (activeSubPageProp.includes("collaborateurs"))
        setActiveSubPage("collaborateurs");
    }
  }, [activeSubPageProp]);

  const chargerLesSocietes = useCallback(() => {
    const societesChargees = chargerSocietes();
    setSocietes(societesChargees);
  }, []);

  const chargerLesUO = useCallback(() => {
    const uoChargees = chargerUO();
    setUOList(uoChargees);
  }, []);

  const chargerLesStatuts = useCallback(() => {
    const statutsCharges = chargerStatuts();
    setStatuts(statutsCharges);
  }, []);

  const chargerLesCollaborateurs = useCallback(() => {
    const collaborateursCharges = chargerCollaborateurs();
    setCollaborateurs(collaborateursCharges);
  }, []);

  // Charger les données au montage et quand on change de sous-page
  useEffect(() => {
    if (activeSubPage === "societes") {
      chargerLesSocietes();
    } else if (activeSubPage === "uo") {
      chargerLesSocietes(); // Pour les dropdowns
      chargerLesUO();
    } else if (activeSubPage === "statuts") {
      chargerLesStatuts();
    } else if (activeSubPage === "collaborateurs") {
      chargerLesCollaborateurs();
    }
  }, [
    activeSubPage,
    chargerLesSocietes,
    chargerLesUO,
    chargerLesStatuts,
    chargerLesCollaborateurs,
  ]);

  // Fonctions pour la gestion des sociétés
  const handleSocieteInputChange = (e) => {
    const { name, value } = e.target;
    setSocieteFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (societeMessage.text) {
      setSocieteMessage({ type: "", text: "" });
    }
  };

  const handleCreateSociete = () => {
    setEditingSociete(null);
    setSocieteFormData({
      nom: "",
      adresse: "",
      email: "",
      telephone: "",
      responsable: "",
    });
    setShowSocieteForm(true);
    setSocieteMessage({ type: "", text: "" });
  };

  const handleEditSociete = (societe) => {
    setEditingSociete(societe);
    setSocieteFormData({
      nom: societe.nom,
      adresse: societe.adresse,
      email: societe.email,
      telephone: societe.telephone,
      responsable: societe.responsable,
    });
    setShowSocieteForm(true);
    setSocieteMessage({ type: "", text: "" });
  };

  const handleDeleteSociete = (societe) => {
    setSocieteToDelete(societe);
    setShowSocieteDeleteConfirm(true);
  };

  const confirmDeleteSociete = () => {
    if (societeToDelete) {
      const resultat = supprimerSociete(societeToDelete.id);
      if (resultat.succes) {
        setSocieteMessage({ type: "success", text: resultat.message });
        chargerLesSocietes();
        setTimeout(() => setSocieteMessage({ type: "", text: "" }), 3000);
      } else {
        setSocieteMessage({ type: "error", text: resultat.message });
        setTimeout(() => setSocieteMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowSocieteDeleteConfirm(false);
    setSocieteToDelete(null);
  };

  const cancelDeleteSociete = () => {
    setShowSocieteDeleteConfirm(false);
    setSocieteToDelete(null);
  };

  const validateSocieteForm = () => {
    if (!societeFormData.nom.trim()) {
      setSocieteMessage({
        type: "error",
        text: "Le nom de la société est obligatoire.",
      });
      return false;
    }

    if (!societeFormData.adresse.trim()) {
      setSocieteMessage({
        type: "error",
        text: "L'adresse est obligatoire.",
      });
      return false;
    }

    if (!societeFormData.email.trim()) {
      setSocieteMessage({
        type: "error",
        text: "L'email est obligatoire.",
      });
      return false;
    }

    if (!societeFormData.telephone.trim()) {
      setSocieteMessage({
        type: "error",
        text: "Le téléphone est obligatoire.",
      });
      return false;
    }

    if (!societeFormData.responsable.trim()) {
      setSocieteMessage({
        type: "error",
        text: "Le responsable est obligatoire.",
      });
      return false;
    }

    return true;
  };

  const handleSocieteSubmit = (e) => {
    e.preventDefault();
    setSocieteMessage({ type: "", text: "" });

    // Validation personnalisée
    if (!validateSocieteForm()) {
      return;
    }

    let resultat;
    if (editingSociete) {
      // Mise à jour
      resultat = mettreAJourSociete(editingSociete.id, societeFormData);
    } else {
      // Création
      resultat = creerSociete(societeFormData);
    }

    if (resultat.succes) {
      setSocieteMessage({ type: "success", text: resultat.message });
      chargerLesSocietes();
      setShowSocieteForm(false);
      setSocieteFormData({
        nom: "",
        adresse: "",
        email: "",
        telephone: "",
        responsable: "",
      });
      setEditingSociete(null);
      setTimeout(() => setSocieteMessage({ type: "", text: "" }), 3000);
    } else {
      setSocieteMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelSociete = () => {
    setShowSocieteForm(false);
    setSocieteFormData({
      nom: "",
      adresse: "",
      email: "",
      telephone: "",
      responsable: "",
    });
    setEditingSociete(null);
    setSocieteMessage({ type: "", text: "" });
  };

  // Fonctions pour la gestion des UO
  const handleUOInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUOFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (uoMessage.text) {
      setUOMessage({ type: "", text: "" });
    }
  };

  const handleCreateUO = () => {
    setEditingUO(null);
    setUOFormData({
      nom: "",
      type: "",
      actif: true,
      societeId: "",
    });
    setShowUOForm(true);
    setUOMessage({ type: "", text: "" });
  };

  const handleEditUO = (uo) => {
    setEditingUO(uo);
    setUOFormData({
      nom: uo.nom,
      type: uo.type,
      actif: uo.actif,
      societeId: uo.societeId != null ? uo.societeId.toString() : "",
    });
    setShowUOForm(true);
    setUOMessage({ type: "", text: "" });
  };

  const handleDeleteUO = (uo) => {
    setUOToDelete(uo);
    setShowUODeleteConfirm(true);
  };

  const confirmDeleteUO = () => {
    if (uoToDelete) {
      const resultat = supprimerUO(uoToDelete.id);
      if (resultat.succes) {
        setUOMessage({ type: "success", text: resultat.message });
        chargerLesUO();
        setTimeout(() => setUOMessage({ type: "", text: "" }), 3000);
      } else {
        setUOMessage({ type: "error", text: resultat.message });
        setTimeout(() => setUOMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowUODeleteConfirm(false);
    setUOToDelete(null);
  };

  const cancelDeleteUO = () => {
    setShowUODeleteConfirm(false);
    setUOToDelete(null);
  };

  const validateUOForm = () => {
    if (!uoFormData.nom.trim()) {
      setUOMessage({
        type: "error",
        text: "Le nom de l'UO est obligatoire.",
      });
      return false;
    }

    if (!uoFormData.type) {
      setUOMessage({
        type: "error",
        text: "Le type de l'UO est obligatoire.",
      });
      return false;
    }

    if (!uoFormData.societeId) {
      setUOMessage({
        type: "error",
        text: "La société est obligatoire.",
      });
      return false;
    }

    return true;
  };

  const handleUOSubmit = (e) => {
    e.preventDefault();
    setUOMessage({ type: "", text: "" });

    // Validation personnalisée
    if (!validateUOForm()) {
      return;
    }

    let resultat;
    if (editingUO) {
      resultat = mettreAJourUO(editingUO.id, uoFormData);
    } else {
      resultat = creerUO(uoFormData);
    }

    if (resultat.succes) {
      setUOMessage({ type: "success", text: resultat.message });
      chargerLesUO();
      setShowUOForm(false);
      setUOFormData({
        nom: "",
        type: "",
        actif: true,
        societeId: "",
      });
      setEditingUO(null);
      setTimeout(() => setUOMessage({ type: "", text: "" }), 3000);
    } else {
      setUOMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelUO = () => {
    setShowUOForm(false);
    setUOFormData({
      nom: "",
      type: "",
      actif: true,
      societeId: "",
    });
    setEditingUO(null);
    setUOMessage({ type: "", text: "" });
  };

  // Fonction pour obtenir le nom de la société
  const getSocieteName = (societeId) => {
    const societe = societes.find((s) => s.id === societeId);
    return societe ? societe.nom : "Société introuvable";
  };

  // Fonction pour obtenir le nom de l'UO parente
  const getUOParentName = (uoParenteId) => {
    if (!uoParenteId) return "-";
    const uoParente = uoList.find((uo) => uo.id === uoParenteId);
    return uoParente ? uoParente.nom : "UO introuvable";
  };

  // Fonction pour filtrer les UO parentes possibles (exclure l'UO actuelle et celles d'une autre société)
  const getUOParentesPossibles = () => {
    if (editingUO) {
      return uoList.filter(
        (uo) =>
          uo.id !== editingUO.id &&
          uo.societeId === parseInt(uoFormData.societeId || editingUO.societeId)
      );
    }
    if (uoFormData.societeId) {
      return uoList.filter(
        (uo) => uo.societeId === parseInt(uoFormData.societeId)
      );
    }
    return uoList;
  };

  // Fonctions pour la gestion des statuts
  const handleStatutInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStatutFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (statutMessage.text) {
      setStatutMessage({ type: "", text: "" });
    }
  };

  const handleCreateStatut = () => {
    setEditingStatut(null);
    setStatutFormData({
      nom: "",
      description: "",
      actif: true,
    });
    setShowStatutForm(true);
    setStatutMessage({ type: "", text: "" });
  };

  const handleEditStatut = (statut) => {
    setEditingStatut(statut);
    setStatutFormData({
      nom: statut.nom,
      description: statut.description || "",
      actif: statut.actif,
    });
    setShowStatutForm(true);
    setStatutMessage({ type: "", text: "" });
  };

  const handleDeleteStatut = (statut) => {
    setStatutToDelete(statut);
    setShowStatutDeleteConfirm(true);
  };

  const confirmDeleteStatut = () => {
    if (statutToDelete) {
      const resultat = supprimerStatut(statutToDelete.id);
      if (resultat.succes) {
        setStatutMessage({ type: "success", text: resultat.message });
        chargerLesStatuts();
        setTimeout(() => setStatutMessage({ type: "", text: "" }), 3000);
      } else {
        setStatutMessage({ type: "error", text: resultat.message });
        setTimeout(() => setStatutMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowStatutDeleteConfirm(false);
    setStatutToDelete(null);
  };

  const cancelDeleteStatut = () => {
    setShowStatutDeleteConfirm(false);
    setStatutToDelete(null);
  };

  const handleStatutSubmit = (e) => {
    e.preventDefault();
    setStatutMessage({ type: "", text: "" });

    let resultat;
    if (editingStatut) {
      resultat = mettreAJourStatut(editingStatut.id, statutFormData);
    } else {
      resultat = creerStatut(statutFormData);
    }

    if (resultat.succes) {
      setStatutMessage({ type: "success", text: resultat.message });
      chargerLesStatuts();
      setShowStatutForm(false);
      setStatutFormData({
        nom: "",
        description: "",
        actif: true,
      });
      setEditingStatut(null);
      setTimeout(() => setStatutMessage({ type: "", text: "" }), 3000);
    } else {
      setStatutMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelStatut = () => {
    setShowStatutForm(false);
    setStatutFormData({
      nom: "",
      description: "",
      actif: true,
    });
    setEditingStatut(null);
    setStatutMessage({ type: "", text: "" });
  };

  // Fonctions pour la gestion des collaborateurs
  const handleCollaborateurInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCollaborateurFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (collaborateurMessage.text) {
      setCollaborateurMessage({ type: "", text: "" });
    }
  };

  const handleCreateCollaborateur = () => {
    setEditingCollaborateur(null);
    setCollaborateurFormData({
      nom: "",
      email: "",
      poste: "",
      telephone: "",
      actif: true,
    });
    setShowCollaborateurForm(true);
    setCollaborateurMessage({ type: "", text: "" });
  };

  const handleEditCollaborateur = (collaborateur) => {
    setEditingCollaborateur(collaborateur);
    setCollaborateurFormData({
      nom: collaborateur.nom,
      email: collaborateur.email,
      poste: collaborateur.poste,
      telephone: collaborateur.telephone,
      actif: collaborateur.actif,
    });
    setShowCollaborateurForm(true);
    setCollaborateurMessage({ type: "", text: "" });
  };

  const handleDeleteCollaborateur = (collaborateur) => {
    setCollaborateurToDelete(collaborateur);
    setShowCollaborateurDeleteConfirm(true);
  };

  const confirmDeleteCollaborateur = () => {
    if (collaborateurToDelete) {
      const resultat = supprimerCollaborateur(collaborateurToDelete.id);
      if (resultat.succes) {
        setCollaborateurMessage({ type: "success", text: resultat.message });
        chargerLesCollaborateurs();
        setTimeout(() => setCollaborateurMessage({ type: "", text: "" }), 3000);
      } else {
        setCollaborateurMessage({ type: "error", text: resultat.message });
        setTimeout(() => setCollaborateurMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowCollaborateurDeleteConfirm(false);
    setCollaborateurToDelete(null);
  };

  const cancelDeleteCollaborateur = () => {
    setShowCollaborateurDeleteConfirm(false);
    setCollaborateurToDelete(null);
  };

  const validateCollaborateurForm = () => {
    if (!collaborateurFormData.nom.trim()) {
      setCollaborateurMessage({
        type: "error",
        text: "Le nom est obligatoire.",
      });
      return false;
    }
    if (!collaborateurFormData.email.trim()) {
      setCollaborateurMessage({
        type: "error",
        text: "L'email est obligatoire.",
      });
      return false;
    }
    return true;
  };

  const handleCollaborateurSubmit = (e) => {
    e.preventDefault();
    setCollaborateurMessage({ type: "", text: "" });

    if (!validateCollaborateurForm()) return;

    let resultat;
    if (editingCollaborateur) {
      resultat = mettreAJourCollaborateur(
        editingCollaborateur.id,
        collaborateurFormData
      );
    } else {
      resultat = creerCollaborateur(collaborateurFormData);
    }

    if (resultat.succes) {
      setCollaborateurMessage({ type: "success", text: resultat.message });
      chargerLesCollaborateurs();
      setShowCollaborateurForm(false);
      setCollaborateurFormData({
        nom: "",
        email: "",
        poste: "",
        telephone: "",
        actif: true,
      });
      setEditingCollaborateur(null);
      setTimeout(() => setCollaborateurMessage({ type: "", text: "" }), 3000);
    } else {
      setCollaborateurMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelCollaborateur = () => {
    setShowCollaborateurForm(false);
    setCollaborateurFormData({
      nom: "",
      email: "",
      poste: "",
      telephone: "",
      actif: true,
    });
    setEditingCollaborateur(null);
    setCollaborateurMessage({ type: "", text: "" });
  };

  const subPages = {
    societes: {
      title: "Gestion des Sociétés",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateSociete}>
              Ajouter une société
            </button>
          </div>

          {showSocieteForm && (
            <div className="modal-overlay" onClick={handleCancelSociete}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>
                    {editingSociete
                      ? "Modifier la société"
                      : "Ajouter une société"}
                  </h3>
                  <button className="modal-close" onClick={handleCancelSociete}>
                    &times;
                  </button>
                </div>
                {societeMessage.text && (
                  <div
                    className={`info-box ${
                      societeMessage.type === "error"
                        ? "error-box"
                        : "success-box"
                    }`}
                    style={{
                      margin: "16px 24px 0 24px",
                      padding: "12px",
                      borderRadius: "6px",
                      backgroundColor:
                        societeMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                      border: `1px solid ${
                        societeMessage.type === "error" ? "#fecaca" : "#a7f3d0"
                      }`,
                      color:
                        societeMessage.type === "error" ? "#991b1b" : "#065f46",
                    }}
                  >
                    <p style={{ margin: 0 }}>{societeMessage.text}</p>
                  </div>
                )}
                <form onSubmit={handleSocieteSubmit}>
                  <div className="form-group">
                    <label htmlFor="societeId">Identifiant de la société</label>
                    <input
                      type="text"
                      id="societeId"
                      value={
                        editingSociete
                          ? editingSociete.id
                          : "Généré automatiquement"
                      }
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="societeNom">
                      Nom <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="societeNom"
                      name="nom"
                      value={societeFormData.nom}
                      onChange={handleSocieteInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="societeAdresse">
                      Adresse <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="societeAdresse"
                      name="adresse"
                      value={societeFormData.adresse}
                      onChange={handleSocieteInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="societeEmail">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="societeEmail"
                      name="email"
                      value={societeFormData.email}
                      onChange={handleSocieteInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="societeTelephone">
                      Téléphone <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="societeTelephone"
                      name="telephone"
                      value={societeFormData.telephone}
                      onChange={handleSocieteInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="societeResponsable">
                      Responsable <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="societeResponsable"
                      name="responsable"
                      value={societeFormData.responsable}
                      onChange={handleSocieteInputChange}
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingSociete ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelSociete}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des sociétés</h3>
            {societes.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucune société créée pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Adresse</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Responsable</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {societes.map((societe) => (
                    <tr key={societe.id}>
                      <td>{societe.nom}</td>
                      <td>{societe.adresse}</td>
                      <td>{societe.email}</td>
                      <td>{societe.telephone}</td>
                      <td>{societe.responsable}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => handleEditSociete(societe)}
                          style={{ marginRight: "5px" }}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteSociete(societe)}
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
    uo: {
      title: "Gestion des Unités Organisationnelles",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateUO}>
              Ajouter une unité organisationnelle
            </button>
          </div>

          {showUOForm && (
            <div className="modal-overlay" onClick={handleCancelUO}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "600px" }}
              >
                <div className="modal-header">
                  <h3>
                    {editingUO
                      ? "Modifier l'unité organisationnelle"
                      : "Ajouter une unité organisationnelle"}
                  </h3>
                  <button className="modal-close" onClick={handleCancelUO}>
                    &times;
                  </button>
                </div>
                {uoMessage.text && (
                  <div
                    className={`info-box ${
                      uoMessage.type === "error" ? "error-box" : "success-box"
                    }`}
                    style={{
                      margin: "16px 24px 0 24px",
                      padding: "12px",
                      borderRadius: "6px",
                      backgroundColor:
                        uoMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                      border: `1px solid ${
                        uoMessage.type === "error" ? "#fecaca" : "#a7f3d0"
                      }`,
                      color: uoMessage.type === "error" ? "#991b1b" : "#065f46",
                    }}
                  >
                    <p style={{ margin: 0 }}>{uoMessage.text}</p>
                  </div>
                )}
                <form onSubmit={handleUOSubmit}>
                  <div className="form-group">
                    <label htmlFor="uoId">Identifiant de l'UO</label>
                    <input
                      type="text"
                      id="uoId"
                      value={
                        editingUO ? editingUO.id : "Généré automatiquement"
                      }
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="uoNom">
                      Nom de l'UO <span className="required">*</span>
                      <span className="hint">(max 100 caractères)</span>
                    </label>
                    <input
                      type="text"
                      id="uoNom"
                      name="nom"
                      value={uoFormData.nom}
                      onChange={handleUOInputChange}
                      maxLength={100}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="uoType">
                      Type de l'UO <span className="required">*</span>
                    </label>
                    <select
                      id="uoType"
                      name="type"
                      value={uoFormData.type}
                      onChange={handleUOInputChange}
                    >
                      {getTypesUO().map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <SocieteInput
                    label="Société"
                    id="uoSocieteId"
                    name="societeId"
                    value={uoFormData.societeId}
                    onChange={(value) => {
                      setUOFormData((prev) => ({
                        ...prev,
                        societeId: value,
                      }));
                      if (uoMessage.text) {
                        setUOMessage({ type: "", text: "" });
                      }
                    }}
                    multiple={false}
                    required={true}
                  />
                  <div className="form-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="actif"
                        checked={uoFormData.actif}
                        onChange={handleUOInputChange}
                      />
                      <span>Actif</span>
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingUO ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelUO}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des unités organisationnelles</h3>
            {uoList.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucune unité organisationnelle créée pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Adresse</th>
                    <th>Code postal</th>
                    <th>Société</th>
                    <th>UO parente</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uoList.map((uo) => (
                    <tr key={uo.id}>
                      <td>{uo.nom}</td>
                      <td>{uo.type}</td>
                      <td>{uo.adresse}</td>
                      <td>{uo.codePostal}</td>
                      <td>{getSocieteName(uo.societeId)}</td>
                      <td>{getUOParentName(uo.uoParenteId)}</td>
                      <td>{uo.actif ? "Actif" : "Non actif"}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => handleEditUO(uo)}
                          style={{ marginRight: "5px" }}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteUO(uo)}
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
    statuts: {
      title: "Gestion des Statuts",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateStatut}>
              Ajouter un statut
            </button>
          </div>

          {showStatutForm && (
            <div className="modal-overlay" onClick={handleCancelStatut}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "600px" }}
              >
                <div className="modal-header">
                  <h3>
                    {editingStatut ? "Modifier le statut" : "Ajouter un statut"}
                  </h3>
                  <button className="modal-close" onClick={handleCancelStatut}>
                    &times;
                  </button>
                </div>
                {statutMessage.text && (
                  <div
                    className={`info-box ${
                      statutMessage.type === "error"
                        ? "error-box"
                        : "success-box"
                    }`}
                    style={{
                      margin: "16px 24px 0 24px",
                      padding: "12px",
                      borderRadius: "6px",
                      backgroundColor:
                        statutMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                      border: `1px solid ${
                        statutMessage.type === "error" ? "#fecaca" : "#a7f3d0"
                      }`,
                      color:
                        statutMessage.type === "error" ? "#991b1b" : "#065f46",
                    }}
                  >
                    <p style={{ margin: 0 }}>{statutMessage.text}</p>
                  </div>
                )}
                <form onSubmit={handleStatutSubmit}>
                  <div className="form-group">
                    <label htmlFor="statutId">Identifiant du statut</label>
                    <input
                      type="text"
                      id="statutId"
                      value={
                        editingStatut
                          ? editingStatut.id
                          : "Généré automatiquement"
                      }
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="statutNom">
                      Nom du statut <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="statutNom"
                      name="nom"
                      value={statutFormData.nom}
                      onChange={handleStatutInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="statutDescription">Description</label>
                    <textarea
                      id="statutDescription"
                      name="description"
                      value={statutFormData.description}
                      onChange={handleStatutInputChange}
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="actif"
                        checked={statutFormData.actif}
                        onChange={handleStatutInputChange}
                      />
                      <span>Actif</span>
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingStatut ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelStatut}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des statuts</h3>
            {statuts.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucun statut créé pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statuts.map((statut) => (
                    <tr key={statut.id}>
                      <td>{statut.nom}</td>
                      <td>{statut.description || "-"}</td>
                      <td>{statut.actif ? "Actif" : "Non actif"}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => handleEditStatut(statut)}
                          style={{ marginRight: "5px" }}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteStatut(statut)}
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
    collaborateurs: {
      title: "Gestion des Collaborateurs",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateCollaborateur}>
              Ajouter un collaborateur
            </button>
          </div>

          {collaborateurMessage.text && (
            <div
              className={`info-box ${
                collaborateurMessage.type === "error"
                  ? "error-box"
                  : "success-box"
              }`}
              style={{
                margin: "16px 0",
                backgroundColor:
                  collaborateurMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                borderColor:
                  collaborateurMessage.type === "error" ? "#fecaca" : "#a7f3d0",
                color:
                  collaborateurMessage.type === "error" ? "#991b1b" : "#065f46",
              }}
            >
              <p style={{ margin: 0 }}>{collaborateurMessage.text}</p>
            </div>
          )}

          {showCollaborateurForm && (
            <div className="modal-overlay" onClick={handleCancelCollaborateur}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "620px" }}
              >
                <div className="modal-header">
                  <h3>
                    {editingCollaborateur
                      ? "Modifier le collaborateur"
                      : "Ajouter un collaborateur"}
                  </h3>
                  <button
                    className="modal-close"
                    onClick={handleCancelCollaborateur}
                  >
                    &times;
                  </button>
                </div>
                <form onSubmit={handleCollaborateurSubmit}>
                  <div className="form-group">
                    <label htmlFor="collabId">Identifiant</label>
                    <input
                      type="text"
                      id="collabId"
                      value={
                        editingCollaborateur
                          ? editingCollaborateur.id
                          : "Généré automatiquement"
                      }
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="collabNom">
                      Nom <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="collabNom"
                      name="nom"
                      value={collaborateurFormData.nom}
                      onChange={handleCollaborateurInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="collabEmail">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="collabEmail"
                      name="email"
                      value={collaborateurFormData.email}
                      onChange={handleCollaborateurInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="collabPoste">Poste / Rôle</label>
                    <input
                      type="text"
                      id="collabPoste"
                      name="poste"
                      value={collaborateurFormData.poste}
                      onChange={handleCollaborateurInputChange}
                      placeholder="Ex: Développeur, PO, QA"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="collabTelephone">Téléphone</label>
                    <input
                      type="tel"
                      id="collabTelephone"
                      name="telephone"
                      value={collaborateurFormData.telephone}
                      onChange={handleCollaborateurInputChange}
                      placeholder="+225..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="actif"
                        checked={collaborateurFormData.actif}
                        onChange={handleCollaborateurInputChange}
                      />
                      <span>Actif</span>
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingCollaborateur ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelCollaborateur}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des collaborateurs</h3>
            {collaborateurs.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucun collaborateur créé pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Poste</th>
                    <th>Téléphone</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collaborateurs.map((collaborateur) => (
                    <tr key={collaborateur.id}>
                      <td>{collaborateur.nom}</td>
                      <td>{collaborateur.email}</td>
                      <td>{collaborateur.poste || "-"}</td>
                      <td>{collaborateur.telephone || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            collaborateur.actif
                              ? "badge-success"
                              : "badge-secondary"
                          }`}
                        >
                          {collaborateur.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => handleEditCollaborateur(collaborateur)}
                          style={{ marginRight: "5px" }}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() =>
                            handleDeleteCollaborateur(collaborateur)
                          }
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
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{subPages[activeSubPage].title}</h1>
        <p>Configurez les paramètres du système</p>
      </div>

      <div className="page-content">{subPages[activeSubPage].content}</div>

      {/* Popup de confirmation de suppression de statut */}
      {showStatutDeleteConfirm && statutToDelete && (
        <div className="modal-overlay" onClick={cancelDeleteStatut}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer le statut{" "}
                <strong>"{statutToDelete.nom}"</strong> ?
              </p>
              <p className="confirm-warning">
                Cette action est irréversible. Un statut ne peut pas être
                supprimé s'il est utilisé dans une demande.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteStatut}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteStatut}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmation de suppression d'UO */}
      {showUODeleteConfirm && uoToDelete && (
        <div className="modal-overlay" onClick={cancelDeleteUO}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer l'unité organisationnelle{" "}
                <strong>"{uoToDelete.nom}"</strong> ?
              </p>
              <p className="confirm-warning">
                Cette action est irréversible. Une UO ne peut pas être supprimée
                si elle contient des utilisateurs ou des UO filles.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteUO}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteUO}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmation de suppression de société */}
      {showSocieteDeleteConfirm && societeToDelete && (
        <div className="modal-overlay" onClick={cancelDeleteSociete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer la société{" "}
                <strong>"{societeToDelete.nom}"</strong> ?
              </p>
              <p className="confirm-warning">
                Cette action est irréversible. Une société ne peut pas être
                supprimée si elle possède des utilisateurs actifs.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteSociete}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteSociete}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmation de suppression de collaborateur */}
      {showCollaborateurDeleteConfirm && collaborateurToDelete && (
        <div className="modal-overlay" onClick={cancelDeleteCollaborateur}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer le collaborateur{" "}
                <strong>"{collaborateurToDelete.nom}"</strong> ?
              </p>
              <p className="confirm-warning">Cette action est irréversible.</p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteCollaborateur}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteCollaborateur}
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

export default Parametrage;
