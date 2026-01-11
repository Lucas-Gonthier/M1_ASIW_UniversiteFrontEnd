import { Parcours } from './Parcours'; 

 

export interface IUE { 

  id: number | null; 

  intitule: string | null; 

  numeroUe: string | null; 

  parcours: Parcours[] | null; 

 

  toJSON(): Object; 

} 

 

export class UE implements IUE { 

  constructor( 

    public id: number | null, 

    public intitule: string | null, 

    public numeroUe: string | null, 

    public parcours: Parcours[] | null 

  ) {} 

 

  toJSON(): Object { 

    return { 

      id: this.id, 

      intitule: this.intitule, 

      numeroUe: this.numeroUe, 
      
      parcours: this.parcours?.map((parcours) => parcours.id) 

    }; 

  } 

} 