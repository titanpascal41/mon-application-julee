import "./PageStyles.css";

const AnalysePerformance = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Analyse et Calcul de Performance</h1>
        <p>Analysez les performances et les KPIs</p>
      </div>
      
      <div className="page-content">
        <div className="kpi-grid">
          <div className="kpi-card">
            <h3>Taux d'avancement</h3>
            <p className="kpi-value">75%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '75%'}}></div>
            </div>
          </div>
          
          <div className="kpi-card">
            <h3>Vélocité</h3>
            <p className="kpi-value">42 points</p>
            <p className="kpi-subtitle">par sprint</p>
          </div>
          
          <div className="kpi-card">
            <h3>Taux de réussite</h3>
            <p className="kpi-value">92%</p>
            <p className="kpi-subtitle">des tâches complétées</p>
          </div>
        </div>
        
        <div className="chart-placeholder">
          <h3>Graphiques de performance</h3>
          <p>Les indicateurs de performance seront affichés ici</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysePerformance;

