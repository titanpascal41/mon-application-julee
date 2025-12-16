import Home from "./home"
import Navbar from "./navbar";

function App() {
  const titre = "orange ";
  const nombre = 15;
  const lien = "https://koki.dexignzone.com/react/?storefront=envato-elements";

  return (
    <div className="App">
      <Navbar />
      < Home />
      <div className="content">
        <h1>
          app content {titre} {nombre}{" "}
        </h1>
        <p>Loradipisicing elit. </p>
        <p>{10}</p>
        <p>10</p>
        <p>{[1, 4, 2, 5]}</p>
        <p>{Math.random() * 1}</p>
        <a href={lien} target="_blank">
          google
        </a>
      </div>
    </div>
  );
}

export default App;
