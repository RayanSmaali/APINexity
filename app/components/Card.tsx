


/*----------------------------------------------------------------
  function formatDate(dateString) : 
    -dateString :  Chaine de caractère indiquant la date et l'heure de création d'un ticket telle qu'elle est reçu par le biais de l'API
    -(return) Intl.DateTimeFormat : sortie formaté pour affichage de la date et de l'heure

    Simple fonction utilisant des méthodes natives de JavaScript pour afficher la date de création d'un ticket
  ----------------------------------------------------------------*/
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long', // "lundi"
        day: '2-digit',  // "17"
        month: 'long',   // "janvier"
        year: 'numeric', // "2025"
        hour: '2-digit', // "19"
        minute: '2-digit', // "02"
        second: '2-digit', // "38"
        timeZoneName: 'short' // "GMT+1"
    }).format(date);
};

/*----------------------------------------------------------------
  function renderComment(ticket) : 
    -commentArray :  tableau de sortie de parseComment. typiquement on aura commentArray[i] est le titre ; commentArray[i+1] est la valeur correspondant à ce titre
    -(return) result :  HTML mettant en forme les valeurs
    Fonction qui prend les valeurs parsé de l'API et renvoie un HTML contenant chaque case du tableau ainsi que sa valeur
  ----------------------------------------------------------------*/
  function renderComment(commentArray) {
    if (!commentArray || commentArray.length === 0) return null;
  
    let result = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Regex pour détecter les URLs
  
    for (let i = 0; i < commentArray.length; i += 2) {
      let value = commentArray[i + 1] || "N/A";
  
      // Si la valeur contient un lien, on le remplace par un <a>
      if (typeof value === "string" && urlRegex.test(value)) {
        value = value.split(urlRegex).map((part, index) =>
          urlRegex.test(part) ? (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer">
              {part}
            </a>
          ) : (
            part
          )
        );
      } else {
        // Option pour interpréter du HTML 
        //value = <span dangerouslySetInnerHTML={{ __html: value }} />;
      }
  
      result.push(
        <div key={i} className="comment-pair">
          <strong>{commentArray[i]}</strong> : {value}
        </div>
      );
    }
  
    return result;
  }
  
  
  function SendConfirmation(e, RFC_NUMBER) {
    e.preventDefault(); // Empêche l'action par défaut du bouton

    const BASE_URL_CONFIRM = 'http://localhost:8080/api/confirm/actions';
    const API_ENDPOINT = `${BASE_URL_CONFIRM}/${RFC_NUMBER}`;

    const requestBody = {
        "end_action": {
            "description": "Closed by STEM API",
            "doneby_name": "API, Stem"
        }
    };

    fetch(API_ENDPOINT, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur lors de la demande à l'api: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Action terminée avec succès :", data);
        alert(`Le ticket ${RFC_NUMBER} a été marqué comme terminé.`);
    })
    .catch(error => {
        console.error("Erreur lors de la confirmation :", error);
        alert(`Erreur : Impossible de terminer le ticket ${RFC_NUMBER}.`);
    });
}


const Card = ({allTickets, allComments}) => 
{
  

  return(
    <div className="container">
              {allTickets.records
              //.filter(ticket => (ticket.STATUS.STATUS_ID == 9 || ticket.STATUS.STATUS_ID == 8))
              .slice(0)
              .reverse() //slice et reverse permettent d'inverser la liste pour avoir les tickets plus récent en premier
              .map((ticket, index) => (

                <div key={`ticket${index}`} className="ticket">
                  <label>{ticket.CATALOG_REQUEST.TITLE_FR}</label>
                  <br />
                  <label>Numéro de la requête : {ticket.RFC_NUMBER}</label>
                  <br />
                  <label>{formatDate(ticket.SUBMIT_DATE_UT)}</label>
                  <br />
                  <br />
                  {renderComment(allComments.slice(0).reverse()[index])}
                  <button onClick={(e) => SendConfirmation(e, ticket.RFC_NUMBER)}>Terminé</button>
                </div>
                
              ))}               
            </div>
     )
  }
   
export default Card;