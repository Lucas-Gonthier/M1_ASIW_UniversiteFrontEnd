import type { Etudiant } from '../entities/Etudiant';
import type { Parcours } from '../entities/Parcours'; 
import { Parcours as ParcoursClass } from '../entities/Parcours';
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

  private normalizeParcours(data: any): Parcours {
    return new ParcoursClass(
      data.id || data.Id,
      data.nomParcours || data.NomParcours,
      data.anneeFormation || data.AnneeFormation
    );
  }

  public async create(data: Parcours): Promise<Parcours> { 
    try { 
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/parcours`, data);
      return this.normalizeParcours(response.data);
    } catch (error) { 
      throw new Error('Impossible de créer le nouveau parcours'); 
    } 
  } 
  
  public async get(id: number): Promise<Parcours> { 
    // Retrieve a Parcours document from the database 
    try { 
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/parcours/${id}`); 
      return this.normalizeParcours(response.data);
    } catch (error) { 
      throw new Error('Impossible de récupérer le parcours'); 
    } 
  } 
 
  public async update(id: number, data: Parcours): Promise<Parcours> { 
    try { 
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/parcours/${id}`, data); 
      return this.normalizeParcours(response.data);
    } catch (error) { 
      throw new Error('Impossible de mettre à jour le parcours'); 
    }
  } 

  public async delete(id: number): Promise<void> { 
    try { 
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/parcours/${id}`); 
      return response.data; 
    } catch (error) { 
      throw new Error('Impossible de supprimer le parcours'); 
    }
  } 
 
  public async list(): Promise<Parcours[]> { 
    try { 
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/parcours`); 
      return response.data
              .map((item: any) => this.normalizeParcours(item))
              .sort((a: Parcours, b: Parcours) => (a.id || 0) - (b.id || 0));
    } catch (error) {
      throw new Error('Impossible de récupérer la liste des parcours');
    } 
  } 
} 