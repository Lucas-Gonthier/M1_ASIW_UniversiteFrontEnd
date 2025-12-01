export interface IParcours {
  id: number | null;
  nomParcours: string | null;
  anneeFormation: number | null;
}

export class Parcours implements IParcours {
  constructor(
    public id: number | null,
    public nomParcours: string | null,
    public anneeFormation: number | null
  ) {}
}