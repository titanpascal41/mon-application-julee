import { useState, useEffect, useRef } from "react";
import { chargerSocietes, creerSocieteSimple } from "../data/societes";

/**
 * Composant réutilisable pour la sélection/création de sociétés
 * @param {Object} props
 * @param {Array|string} props.value - Valeur(s) sélectionnée(s) - peut être un tableau d'IDs ou un seul ID
 * @param {Function} props.onChange - Callback appelé quand la valeur change (reçoit un tableau d'IDs ou un seul ID selon multiple)
 * @param {boolean} props.multiple - Si true, permet la sélection multiple
 * @param {boolean} props.required - Si true, le champ est obligatoire
 * @param {string} props.label - Label du champ
 * @param {string} props.id - ID du champ
 * @param {string} props.name - Nom du champ
 * @param {boolean} props.disabled - Si true, désactive le champ
 */
const SocieteInput = ({
  value,
  onChange,
  multiple = false,
  required = false,
  label = "Société",
  id = "societeInput",
  name = "societe",
  disabled = false,
}) => {
  const [societes, setSocietes] = useState([]);
  const [nouvelleSociete, setNouvelleSociete] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef(null);

  // Charger les sociétés au montage
  useEffect(() => {
    const societesChargees = chargerSocietes();
    setSocietes(societesChargees);
  }, []);

  // Recharger les sociétés après création
  const rechargerSocietes = () => {
    const societesChargees = chargerSocietes();
    setSocietes(societesChargees);
  };

  // Gérer le changement de sélection dans le select
  const handleSelectChange = (e) => {
    if (multiple) {
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      onChange(selectedOptions);
    } else {
      onChange(e.target.value);
    }
    setNouvelleSociete("");
    setShowInput(false);
  };

  // Gérer la saisie d'une nouvelle société
  const handleNouvelleSocieteChange = (e) => {
    setNouvelleSociete(e.target.value);
  };

  // Créer une nouvelle société et l'ajouter à la sélection
  const handleCreerSociete = async () => {
    if (!nouvelleSociete.trim()) {
      return;
    }

    setIsCreating(true);
    const resultat = creerSocieteSimple(nouvelleSociete.trim());

    if (resultat.succes) {
      rechargerSocietes();
      const nouvelleSocieteId = resultat.societe.id.toString();

      if (multiple) {
        // Ajouter à la sélection multiple
        const valeursActuelles = Array.isArray(value) ? value : [];
        if (!valeursActuelles.includes(nouvelleSocieteId)) {
          onChange([...valeursActuelles, nouvelleSocieteId]);
        }
      } else {
        // Sélectionner la nouvelle société
        onChange(nouvelleSocieteId);
      }

      setNouvelleSociete("");
      setShowInput(false);
    }

    setIsCreating(false);
  };

  // Gérer la touche Entrée pour créer la société
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreerSociete();
    }
  };

  // Afficher/masquer l'input de nouvelle société
  const toggleInput = () => {
    setShowInput(!showInput);
    if (!showInput && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Obtenir les valeurs sélectionnées pour le select
  const getSelectedValues = () => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    } else {
      return value || "";
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label} {required && <span className="required">*</span>}
      </label>

      {/* Select avec les sociétés existantes */}
      <div style={{ position: "relative", marginBottom: "8px" }}>
        <select
          id={id}
          name={name}
          value={getSelectedValues()}
          onChange={handleSelectChange}
          multiple={multiple}
          disabled={disabled || societes.length === 0}
          size={multiple ? (societes.length === 0 ? 1 : Math.min(societes.length, 5)) : undefined}
          style={{
            width: "100%",
            minHeight: multiple ? "120px" : undefined,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
          }}
        >
          {societes.length === 0 ? (
            <option value="" disabled>
              Aucune société disponible
            </option>
          ) : (
            societes.map((societe) => (
              <option key={societe.id} value={societe.id.toString()}>
                {societe.nom}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Bouton pour ajouter une nouvelle société */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {!showInput ? (
          <button
            type="button"
            onClick={toggleInput}
            disabled={disabled}
            style={{
              padding: "6px 12px",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: "14px",
              color: disabled ? "#9ca3af" : "#374151",
            }}
          >
            + Ajouter une nouvelle société
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "8px",
              width: "100%",
              alignItems: "center",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Nom de la nouvelle société"
              value={nouvelleSociete}
              onChange={handleNouvelleSocieteChange}
              onKeyPress={handleKeyPress}
              disabled={disabled || isCreating}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
              }}
            />
            <button
              type="button"
              onClick={handleCreerSociete}
              disabled={disabled || isCreating || !nouvelleSociete.trim()}
              style={{
                padding: "8px 16px",
                backgroundColor: isCreating ? "#9ca3af" : "#4A90E2",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor:
                  disabled || isCreating || !nouvelleSociete.trim()
                    ? "not-allowed"
                    : "pointer",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              {isCreating ? "Création..." : "Créer"}
            </button>
            <button
              type="button"
              onClick={toggleInput}
              disabled={disabled || isCreating}
              style={{
                padding: "8px 12px",
                backgroundColor: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: disabled || isCreating ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {showInput && (
        <small
          style={{
            display: "block",
            marginTop: "4px",
            color: "#6b7280",
            fontSize: "12px",
          }}
        >
          La société sera créée automatiquement avec les informations de base.
          Vous pourrez compléter les détails plus tard dans les paramètres.
        </small>
      )}
    </div>
  );
};

export default SocieteInput;










