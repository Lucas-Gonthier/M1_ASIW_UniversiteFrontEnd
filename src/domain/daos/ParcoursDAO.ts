import type { Parcours } from '../entities/Parcours'; 
import type { IDAO } from '../IDAO';
import axios from 'axios'; 

export class ParcoursDAO implements IDAO<Parcours> { 

  private static instance: ParcoursDAO; 

  private constructor() {} 

  public static getInstance(): ParcoursDAO { 
    if (!ParcoursDAO.instance) { 
      ParcoursDAO.instance = new ParcoursDAO(); 
    } 
    return ParcoursDAO.instance; 
  } 

    public async create(data: Parcours): Promise<Parcours> { 
    try { 
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Parcours`, data); 
      return response.data; 
    } catch (error) { 
      throw new Error('Impossible de créer le nouveau parcours'); 
    } 
  } 
  
  public async get(id: number): Promise<Parcours> { 
    // Retrieve a Parcours document from the database 
    return { id: id, nomParcours: 'Parcours 1', anneeFormation: 2024 }; 
  } 
 
  public async update(id: number, data: Parcours): Promise<Parcours> { 
    try { 
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Parcours/${id}`, data); 
      return response.data; 
    } catch (error) { 
      throw new Error('Impossible de mettre à jour le parcours'); 
    }
  } 

  public async delete(id: number): Promise<void> { 
    // Delete a Parcours document from the database 
  } 
 
  public async list(): Promise<Parcours[]> { 
    try { 
      //const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Parcours`); 
      //return response.data;
      return [
        { id: 1, nomParcours: 'Informatique', anneeFormation: 2024 },
        { id: 2, nomParcours: 'Mathématiques', anneeFormation: 2024 },
        { id: 3, nomParcours: 'Physique', anneeFormation: 2024 },
      ];
    } catch (error) {
      throw new Error('Impossible de récupérer la liste des parcours');
    } 
    
  } 
} 