"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import Card from './components/Card';

const Home = () => {
  const [allTickets, setAllTickets] = useState(null);
  const [loadingRequests, setloadingRequests] = useState(true);
  const [loadingComments, setloadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [allComments, setAllComments] = useState([]);
  const [filters, setFilters] = useState([true,false,false,false,false]);


  const updateFilter = (index, newValue) => {
    setFilters(prevTableau => {
      const newTableau = [...prevTableau];
      newTableau[index] = newValue;
      return newTableau;
    });
  };

  /*----------------------------------------------------------------
  function parseComment(comment) : 
    -comment :  chaine de caractère décrivant un tableau HTML telle qu'elle est reçue lors de la requête API,
    -(return) split string : array contenant chaque case du tableau HTML

    La fonction parse la chaine de caractère reçu en supprimant les différentes balises qui composent le tableau HTML. 
    On va ensuite séparer chaque case du tableau avec la méthode .split pour l'insérer dans un array que l'on renvoie.
  ----------------------------------------------------------------*/
  function parseComment(comment) {
    const str_cleaned = comment.replaceAll("<table>", "")
      .replaceAll("</table>", "")
      .replaceAll("<tr>", "")
      .replaceAll("</tr>", "")
      .replaceAll("</td>", "")
      .replaceAll("<p>", "")
      .replaceAll("</p>", "")
      .replaceAll("<b>", "")
      .replaceAll("</b>", "")
      .replaceAll("<ol>", "")
      .replaceAll("<li>", "")
      .replaceAll("<i>", "")
      .replaceAll("</ol>", "")
      .replaceAll("</li>", "")
      .replaceAll("</i>", "")
      .replaceAll("<br>", "\n")
      .replace("<td>", ""); // Replace normal pour ne supprimer que le premier

    return str_cleaned.split("<td>");
  }

  /*----------------------------------------------------------------
  function fetchAllComments() : Récupère tous les commentaires liés aux tickets.
  ----------------------------------------------------------------*/
  const fetchAllComments = async () => {
    try {
      setloadingComments(true);
      const commentsPromises = allTickets.records.map(async (ticket) => {
        const response = await fetch(`/api/tickets/${ticket.RFC_NUMBER}/comment`, {
          method: "GET"
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return parseComment(data.COMMENT);
      });

      const commentsArray = await Promise.all(commentsPromises);
      setAllComments(commentsArray);
    } catch (error) {
      setError(error.message);
    } finally {
      setloadingComments(false);
    }
  };

  /*----------------------------------------------------------------
  function getAllTickets() : Récupère tous les tickets et met à jour le state.
  ----------------------------------------------------------------*/
  const getAllTickets = async () => {
    try {
      setloadingRequests(true);
      setError(null);

      const response = await fetch(`/api/tickets`, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
       
      if(!filters[0])
        data.records = data.records.filter(ticket => ticket.STATUS.STATUS_ID !== "12") // En cours
      if(!filters[1])
        data.records = data.records.filter(ticket => ticket.STATUS.STATUS_ID !== "9") // En attente de validation
      if(!filters[2])
        data.records = data.records.filter(ticket => ticket.STATUS.STATUS_ID !== "8") // Clôturé
      if(!filters[3])
        data.records = data.records.filter(ticket => ticket.STATUS.STATUS_ID !== "7") // Archivé
      if(!filters[4])
        data.records = data.records.filter(ticket => ticket.STATUS.STATUS_ID !== "43") // Annulé par le demandeur


      setAllTickets(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setloadingRequests(false);
    }
  };

  /*----------------------------------------------------------------
  useEffect() : Exécute la récupération des tickets au montage du composant.
  ----------------------------------------------------------------*/
  useEffect(() => {
    getAllTickets();
  }, []);

  /*----------------------------------------------------------------
  useEffect() : Exécute la récupération des commentaires après chargement des tickets.
  ----------------------------------------------------------------*/
  useEffect(() => {
    if (allTickets) {
      fetchAllComments();
    }
  }, [loadingRequests]);

  if (loadingRequests) return <p>Chargement des requêtes...</p>;
  if (loadingComments) return <p>Chargement des commentaires...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h1>Gestionnaire de Ticket Nexity</h1>
      <div className="logo">
        <Image src="/logo.png" width={699/2.2} height={414/2.2} alt="Stem Logo" />
      </div>
      <h3>Filtres : </h3>

      <div>
        <label htmlFor="EnCours">En cours</label>
        <input type="checkbox" id="EnCours" name="EnCours" checked={filters[0]} onChange={(event) => updateFilter(0, event.target.checked)}  />
      </div>
      
      <div>
        <label htmlFor="validate">En attente de validation</label>
        <input type="checkbox" id="validate" name="validate" checked={filters[1]}  onChange={(event) => updateFilter(1, event.target.checked)}  />
      </div>

      <div>
        <label htmlFor="EnCours">Clôturés</label>
        <input type="checkbox" id="closed" name="closed" checked={filters[2]}  onChange={(event) => updateFilter(2, event.target.checked)}  />
      </div>

      <div>
        <label htmlFor="EnCours">Archivé</label>
        <input type="checkbox" id="archived" name="archived" checked={filters[3]}  onChange={(event) => updateFilter(3, event.target.checked)}  />
      </div>

      <div>
        <label htmlFor="EnCours">Annulé par le demandeur</label>
        <input type="checkbox" id="Canceled" name="Canceled" checked={filters[4]}  onChange={(event) => updateFilter(4, event.target.checked)}  />
      </div>

      <button onClick={getAllTickets}>Filtrer</button>

      
      {(allTickets && allComments) && <Card allTickets={allTickets} allComments={allComments} />}
    </div>
  );
};

export default Home;
