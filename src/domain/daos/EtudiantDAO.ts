import type { Etudiant } from '../entities/Etudiant';
import { Etudiant as EtudiantClass } from '../entities/Etudiant';
import type { IDAO } from '../IDAO';
import axios from 'axios';

export class EtudiantDAO implements IDAO<Etudiant> {

  private static instance: EtudiantDAO;

  private constructor() {}

  public static getInstance(): EtudiantDAO {
    if (!EtudiantDAO.instance) {
      EtudiantDAO.instance = new EtudiantDAO();
    }
    return EtudiantDAO.instance;
  }

  private normalizeEtudiant(data: any): Etudiant {
    return new EtudiantClass(
      data.id || data.Id,
      data.nom || data.Nom,
      data.prenom || data.Prenom,
      data.email || data.Email,
      data.parcours || data.Parcours
    );
  }

  public async create(data: Etudiant): Promise<Etudiant> {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/etudiants`, data);
      return this.normalizeEtudiant(response.data);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Impossible de créer le nouvel étudiant";
      throw new Error(msg);
    }
  }

  public async get(id: number): Promise<Etudiant> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/etudiants/${id}`);
      return this.normalizeEtudiant(response.data);
    } catch (error) {
      throw new Error("Impossible de récupérer l'étudiant");
    }
  }

  public async update(id: number, data: Etudiant): Promise<Etudiant> {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/etudiants/${id}`, data);
      return this.normalizeEtudiant(response.data);
    } catch (error) {
      throw new Error("Impossible de mettre à jour l'étudiant");
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/etudiants/${id}`);
    } catch (error) {
      throw new Error("Impossible de supprimer l'étudiant");
    }
  }

  public async list(): Promise<Etudiant[]> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/etudiants`);
      return response.data
        .map((item: any) => this.normalizeEtudiant(item))
        .sort((a: Etudiant, b: Etudiant) => (a.id || 0) - (b.id || 0));
    } catch (error) {
      throw new Error("Impossible de récupérer la liste des étudiants");
    }
  }
}
