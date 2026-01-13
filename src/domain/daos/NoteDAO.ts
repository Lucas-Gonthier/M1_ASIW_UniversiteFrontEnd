import type { Note } from '../entities/Note';
import { Note as NoteClass } from '../entities/Note';
import type { IDAO } from '../IDAO';
import axios from 'axios';

export class NoteDAO implements IDAO<Note> {

  private static instance: NoteDAO;

  private constructor() {}

  public static getInstance(): NoteDAO {
    if (!NoteDAO.instance) {
      NoteDAO.instance = new NoteDAO();
    }
    return NoteDAO.instance;
  }

  private normalizeNote(data: any): Note {
    return new NoteClass(
        data.id ?? data.Id ?? null,
        data.valeur ?? data.Valeur ?? null,
        data.etudiant_id ?? null,
        data.ue_id ?? null
    );
}


  public async create(data: Note): Promise<Note> {
    try {
      const payload = {
        etudiant_id: data.etudiant_id,
        ue_id: data.ue_id,
        valeur: data.valeur
      };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/notes`, payload);
      return this.normalizeNote(response.data.note || response.data);
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Impossible de créer la note";
      throw new Error(msg);
    }
  }

  public async get(id: number): Promise<Note> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/${id}`);
      return this.normalizeNote(response.data);
    } catch (error) {
      throw new Error("Impossible de récupérer la note");
    }
  }

  public async update(id: number, data: Note): Promise<Note> {
    try {
      const payload = {
        valeur: data.valeur
      };
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, payload);
      return this.normalizeNote(response.data.note || response.data);
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Impossible de mettre à jour la note";
      throw new Error(msg);
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/notes/${id}`);
    } catch (error) {
      throw new Error("Impossible de supprimer la note");
    }
  }

  public async list(): Promise<Note[]> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes`);
      return response.data
        .map((item: any) => this.normalizeNote(item))
        .sort((a: Note, b: Note) => (a.id || 0) - (b.id || 0));
    } catch (error) {
      throw new Error("Impossible de récupérer la liste des notes");
    }
  }

  public async getByUeId(ueId: number): Promise<Note[]> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/ue/${ueId}`);
      return response.data
        .map((item: any) => this.normalizeNote(item))
        .sort((a: Note, b: Note) => (a.id || 0) - (b.id || 0));
    } catch (error) {
      throw new Error("Impossible de récupérer les notes de l'UE");
    }
  }

  public async getByEtudiantId(etudiantId: number): Promise<Note[]> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/etudiant/${etudiantId}`);
      return response.data
        .map((item: any) => this.normalizeNote(item))
        .sort((a: Note, b: Note) => (a.id || 0) - (b.id || 0));
    } catch (error) {
      throw new Error("Impossible de récupérer les notes de l'étudiant");
    }
  }

  public async getByEtudiantAndUe(etudiantId: number, ueId: number): Promise<Note | null> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/etudiant/${etudiantId}/ue/${ueId}`);
      return this.normalizeNote(response.data);
    } catch (error) {
      return null;
    }
  }
}

