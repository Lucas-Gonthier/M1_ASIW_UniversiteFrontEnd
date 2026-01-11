import type { UE } from '../entities/Ue';
import { UE as UEClass } from '../entities/Ue';
import type { IDAO } from '../IDAO';
import axios from 'axios'; 

export class UeDAO implements IDAO<UE> { 

  private static instance: UeDAO; 

  private constructor() {} 

  public static getInstance(): UeDAO { 
    if (!UeDAO.instance) { 
      UeDAO.instance = new UeDAO(); 
    } 
    return UeDAO.instance; 
  }

  private normalizeUE(data: any): UE {
    return new UEClass(
      data.id || data.Id,
      data.intitule || data.Intitule,
      data.numeroUe || data.NumeroUe,
      data.parcours || data.Parcours
    );
  }

  public async create(data: UE): Promise<UE> {
    try {
      // backend endpoints for UEs use /api/ues (plural) for consistency
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ues`, data);
      return this.normalizeUE(response.data);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Impossible de créer la nouvelle UE";
      throw new Error(msg);
    }
  }
  
  public async get(id: number): Promise<UE> { 
    // Retrieve a UE document from the database 
    try { 
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ues/${id}`); 
      return this.normalizeUE(response.data);
    } catch (error) { 
      throw new Error("Impossible de récupérer l'UE"); 
    } 
  } 
 
  public async update(id: number, data: UE): Promise<UE> { 
    try { 
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/ues/${id}`, data); 
      return this.normalizeUE(response.data); 
    } catch (error) { 
      throw new Error("Impossible de mettre à jour l'UE"); 
    }
  } 

  public async delete(id: number): Promise<void> { 
    try { 
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/ues/${id}`); 
    } catch (error) { 
      throw new Error("Impossible de supprimer l'UE"); 
    }
  } 
 
  public async list(): Promise<UE[]> { 
    try { 
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ues`); 
      return response.data
        .map((item: any) => this.normalizeUE(item))
        .sort((a: UE, b: UE) => (a.id || 0) - (b.id || 0));
    } catch (error) {
      throw new Error("Impossible de récupérer la liste des UEs");
    } 
  } 
}