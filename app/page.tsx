"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import Card from './components/Card';





const Home = () => {
  const [allTickets, setAllTickets] = useState(null);
  const [loadingRequests, setloadingRequests] = useState(true);
  const [loadingComments, setloadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [allComments, setAllComments] = useState([])

  const BASE_URL = 'http://localhost:8080/api/get/requests';
  

  
  /*----------------------------------------------------------------
  function parseComment(comment) : 
    -comment :  chaine de caractère décrivant un tableau HTML telle qu'elle est reçue lors de la requête API,
    -(return) split string : array contenant chaque case du tableau HTML

    La fonction parse la chaine de caractère reçu en supprimant les différentes balises qui compose le tableau html. On va ensuite séparé chaque case du tableau avec la méthode .split
    pour l'insérer dans un array que l'on renvoie
  ----------------------------------------------------------------*/
  function parseComment(comment)
  {
    
    let str_cleaned = comment.replaceAll("<table>", "");
    str_cleaned = str_cleaned.replaceAll("</table>", "");
    str_cleaned = str_cleaned.replaceAll("<tr>", "");
    str_cleaned = str_cleaned.replaceAll("</tr>", "");
    str_cleaned = str_cleaned.replaceAll("</td>", "");
    str_cleaned = str_cleaned.replaceAll("<p>", "");
    str_cleaned = str_cleaned.replaceAll("</p>", "");
    str_cleaned = str_cleaned.replaceAll("<b>", "");
    str_cleaned = str_cleaned.replaceAll("</b>", "");
    str_cleaned = str_cleaned.replaceAll("<p>", "");
    str_cleaned = str_cleaned.replaceAll("</p>", "");
    str_cleaned = str_cleaned.replaceAll("<ol>", "");
    str_cleaned = str_cleaned.replaceAll("<li>", "");
    str_cleaned = str_cleaned.replaceAll("<i>", "");
    str_cleaned = str_cleaned.replaceAll("</ol>", "");
    str_cleaned = str_cleaned.replaceAll("</li>", "");
    str_cleaned = str_cleaned.replaceAll("</i>", "");
    str_cleaned = str_cleaned.replaceAll("<br>", "\n");
    str_cleaned = str_cleaned.replace("<td>", "")// replace au lieu de replaceAll pour ne supprimer que le premier
    const split_string = str_cleaned.split("<td>");
    return split_string;
  }
    
    const fetchAllComments = async () => {
      try {
        setloadingComments(true);
        const commentsPromises = allTickets.records.map(async (ticket) => {
          const response = await fetch(`${BASE_URL}/${ticket.RFC_NUMBER}/comment`, {
            method: "GET"
          });

          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          
          const data = await response.json();
          return parseComment(data.COMMENT);
        });

        const commentsArray = await Promise.all(commentsPromises); // Attend que toutes les requêtes soient terminées

        setAllComments(commentsArray); // Mise à jour en une seule fois pour garantir l'ordre
      } catch (error) {
        setError(error.message);
      } finally {
        setloadingComments(false);
      }
    };

  
  /*----------------------------------------------------------------
  function getAllTickets() : 

    fonction qui envoie une requête API au proxy, qui va lui même faire une demande à l'API cible pour récupérer tout les tickets et mettre à jour le state
  ----------------------------------------------------------------*/
  const getAllTickets = async () => 
  {
    
    try {
      setloadingRequests(true);
      setError(null);

      const response = await fetch(`${BASE_URL}`,{
        method : "GET"
      });


      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      data.records = data.records.filter(ticket => (ticket.STATUS.STATUS_ID != 9  //en attente de validation
        && ticket.STATUS.STATUS_ID != 8 //clôturé
        && ticket.STATUS.STATUS_ID != 7 //archivé
        && ticket.STATUS.STATUS_ID != 43 //annulé par le demandeur
        ))
      setAllTickets(data);

    } catch (error) {
      setError(error.message);
    } finally {
      setloadingRequests(false);
    }
  };


  useEffect(() => {
    getAllTickets();
  }, []);
  

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
      <Image
      src="/logo.png"
      width={699/2.2}
      height={414/2.2}
      alt="Stem Logo"
      />
      </div>
      {(allTickets && allComments) &&  (
        <Card allTickets={allTickets} allComments={allComments} />
      )}
    </div>
  );
};

export default Home;
