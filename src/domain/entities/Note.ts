export interface INote {
  id: number | null;
  valeur: number | null;
  etudiant_id: number | null;
  ue_id: number | null;
  toJSON(): Object;
}

export class Note implements INote {
  constructor(
    public id: number | null,
    public valeur: number | null,
    public etudiant_id: number | null,
    public ue_id: number | null
  ) {}

  toJSON(): Object {
    return {
      id: this.id,
      valeur: this.valeur,
      etudiant_id: this.etudiant_id,
      ue_id: this.ue_id,
    };
  }
}
