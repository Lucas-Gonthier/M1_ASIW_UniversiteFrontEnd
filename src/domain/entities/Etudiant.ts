import { Parcours } from './Parcours';

export interface IEtudiant {
  id: number | null;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  parcours: Parcours | null;

  toJSON(): Object;
}

export class Etudiant implements IEtudiant {
  constructor(
    public id: number | null,
    public nom: string | null,
    public prenom: string | null,
    public email: string | null,
    public parcours: Parcours | null
  ) {}

  toJSON(): Object {
    return {
      id: this.id,
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      parcours: this.parcours?.id,
    };
  }
}
