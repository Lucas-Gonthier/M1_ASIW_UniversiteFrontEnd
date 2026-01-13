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
  const id = data.id ?? data.ID ?? null;
  const nom = data.nom ?? data.Nom ?? null;
  const prenom = data.prenom ?? data.Prenom ?? null;
  const email = data.email ?? data.Email ?? null;

  let parcours = null;

  if (data.parcours || data.Parcours) {
    const p = data.parcours ?? data.Parcours;

    parcours = {
      id: p.id ?? p.ID ?? null,
      nomParcours: p.nomParcours ?? p.NomParcours ?? null,
      anneeFormation: p.anneeFormation ?? p.AnneeFormation ?? null
    };
  }

  return new EtudiantClass(
    id,
    nom,
    prenom,
    email,
    parcours
  );
}

  public async create(data: Etudiant): Promise<Etudiant> {
    try {
      const payload = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        parcours: {
          id: data.parcours?.id || null,
          nomParcours: data.parcours?.nomParcours || null,
          anneeFormation: data.parcours?.anneeFormation || null
        }
      };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/etudiants`, payload);
      const responseData = response.data.etudiant || response.data;
      return this.normalizeEtudiant(responseData);
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Impossible de créer le nouvel étudiant";
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
      const payload = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        parcours: {
          id: data.parcours?.id || null,
          nomParcours: data.parcours?.nomParcours || null,
          anneeFormation: data.parcours?.anneeFormation || null
        }
      };
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/etudiants/${id}`, payload);
      const responseData = response.data.etudiant || response.data;
      console.log('Response data from update:', responseData);
      return this.normalizeEtudiant(responseData);
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Impossible de mettre à jour l'étudiant";
      throw new Error(msg);
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
