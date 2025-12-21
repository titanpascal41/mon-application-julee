import imageBeige from "./image/art.jpg";
import logoj from "./image/LOGO J.webp";

const Authentification = () => {
  return (
    <div className="Authentification">
      {/* section de la gauche  */}
      <div className="image">
        <img src={imageBeige} alt="Image beige" />
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
            <img src={logoj} alt="Image beige" />
          </div>
          <br />
          <div className="contener">
            <div className="connecterzvous">
              {" "}
              BIENVENUE <br />
              connectez-vous à JULLEE
            </div>
            <br />
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>

            <input
              id="email"
              type="email"
              placeholder="exemple@mail.fr"
              required
            />
            <br />
            <label htmlFor="password">
              Mot de passe <span className="required">*</span>
            </label>

            <input
              id="password"
              type="password"
              required
              placeholder="****************"
            />
            <br />
            <div className="lebouton">Se connecter</div>
            <br />
            <div className="creationcompte">
              <a href="">créer un compte </a>
            </div>
            <br />
            <div className="administrateur">
              <a href="">connecter vous en tant qu'administrateur</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentification;
