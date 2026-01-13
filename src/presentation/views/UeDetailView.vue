<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { UE } from '@/domain/entities/Ue';
import { Parcours } from '@/domain/entities/Parcours';
import { Etudiant } from '@/domain/entities/Etudiant';
import { Note } from '@/domain/entities/Note';
import { UeDAO } from '@/domain/daos/UeDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { NoteDAO } from '@/domain/daos/NoteDAO';

const route = useRoute();
const router = useRouter();
const ueId = Number(route.params.id);

const currentUe = ref<UE>(new UE(null, null, null, null));
const allParcours = ref<Parcours[]>([]);
const selectedParcours = ref<Parcours[]>([]);
const availableParcours = ref<Parcours[]>([]);
const etudiants = ref<Etudiant[]>([]);
const notes = ref<Note[]>([]);

const formErrors = ref<{
  numeroUe: string | null;
  intitule: string | null;
}>({
  numeroUe: null,
  intitule: null,
});

const loading = ref(true);
const saving = ref(false);
const etudiantsFromParcours = ref<Etudiant[]>([]);
const etudiantsWithNotes = ref<any[]>([]);
const showAddParcoursModal = ref(false);

const updateEtudiantsList = () => {
  if (!selectedParcours.value.length) {
    etudiantsFromParcours.value = [];
    etudiantsWithNotes.value = [];
    return;
  }

  const uniqueEtudiants = new Map<number, Etudiant>();

  etudiants.value.forEach((etudiant) => {
    if (
      etudiant.parcours &&
      selectedParcours.value.some((p) => p.id === etudiant.parcours?.id)
    ) {
      if (!uniqueEtudiants.has(etudiant.id!)) {
        uniqueEtudiants.set(etudiant.id!, etudiant);
      }
    }
  });

  const etudiantsArray = Array.from(uniqueEtudiants.values());
  etudiantsFromParcours.value = etudiantsArray;

  etudiantsWithNotes.value = etudiantsArray.map((etudiant: Etudiant) => {
    const note = notes.value.find((n: any) => {
      const nEtudiantId = n.etudiant?.id ?? n.etudiant_id;
      const nUeId = n.ue?.id ?? n.ue_id;
      return nEtudiantId === etudiant.id && nUeId === currentUe.value.id;
    });

    return {
      id: etudiant.id,
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      nomComplet: `${etudiant.prenom} ${etudiant.nom}`,
      parcours: etudiant.parcours,
      noteId: note?.id || null,
      noteValue: note?.valeur ?? null,
    };
  });
};

const noteTableColumns = [
  { 
    field: 'prenom', 
    label: 'Prénom', 
    formatter: null, 
    onClick: null, 
    style: '' 
  },
  { 
    field: 'nom', 
    label: 'Nom', 
    formatter: null, 
    onClick: null, 
    style: '' 
  },
  { 
    field: 'email', 
    label: 'Email', 
    formatter: null, 
    onClick: null, 
    style: '' 
  },
  { 
    field: 'noteValue', 
    label: 'Note', 
    formatter: (e: any) => e.noteValue !== null ? e.noteValue : '__',
    onClick: null, 
    style: '' 
  },
];

const onLoadData = async () => {
  loading.value = true;
  try {
    const ue = await UeDAO.getInstance().getUEWithParcours(ueId);
    currentUe.value = ue;
    console.log('Loaded UE:', ue);
    const parcoursList = await ParcoursDAO.getInstance().list();
    allParcours.value = parcoursList;

    // utiliser les IDs renvoyés par l’API (ID, pas id)
    let ueParcoursIds: number[] = [];

    if (Array.isArray((ue as any).parcours)) {
      ueParcoursIds = (ue as any).parcours
        .map((p: any) => p.id ?? p.ID) // <--- on lit id OU ID
        .filter((id: any) => id !== null && id !== undefined);
    }

    selectedParcours.value = allParcours.value.filter((p) =>
      ueParcoursIds.includes(p.id!)
    );

    updateAvailableParcours();

    const etudiantsData = await EtudiantDAO.getInstance().list();
    etudiants.value = etudiantsData;

    const notesData = await NoteDAO.getInstance().getByUeId(ueId);
    notes.value = notesData;

    updateEtudiantsList();
  } catch (error: any) {
    notify({
      title: 'Erreur',
      text: error?.message || "Une erreur est survenue lors du chargement",
      type: 'error',
    });
    router.push('/ues');
  } finally {
    loading.value = false;
  }
};


const updateAvailableParcours = () => {
  const selectedIds = new Set(selectedParcours.value.map(p => p.id));
  availableParcours.value = allParcours.value.filter(p => !selectedIds.has(p.id));
};

const addParcours = async (parcours: Parcours) => {
  selectedParcours.value.push(parcours);
  updateAvailableParcours();
  updateEtudiantsList();

  await UeDAO.getInstance().addParcoursUE(
    currentUe.value.id!,
    parcours.id!
  );
};

const addParcoursAndClose = async (parcours: Parcours) => {
  await addParcours(parcours);
  showAddParcoursModal.value = false;
};

const removeParcours = async (parcoursId: number | null) => {
  selectedParcours.value = selectedParcours.value.filter(p => p.id !== parcoursId);
  updateAvailableParcours();
  
  const etudiantsToRemove = etudiants.value
    .filter(e => e.parcours?.id === parcoursId)
    .map(e => e.id);
  
  notes.value = notes.value.filter(n => !etudiantsToRemove.includes(n.etudiant_id || null));
  
  updateEtudiantsList();

  UeDAO.getInstance().removeParcoursUE(currentUe.value.id!, parcoursId!);

  notify({
    title: 'Parcours retiré',
    text: 'Parcours retiré avec succès',
    type: 'success',
  });
};

const saveUE = async () => {
  if (formErrors.value.intitule || formErrors.value.numeroUe) return;

  saving.value = true;
  try {
    await saveUeInfos();      // seulement numéro + intitulé
    await saveNotes();        // boucle sur etudiantsWithNotes

    notify({
      title: 'Succès',
      text: 'UE et notes enregistrées avec succès',
      type: 'success',
    });
  } catch (error: any) {
    notify({
      title: 'Erreur',
      text: error?.message || 'Une erreur est survenue lors de l\'enregistrement',
      type: 'error',
    });
  } finally {
    saving.value = false;
  }
};

const saveUeInfos = async () => {
  const ueToSave = structuredClone(toRaw(currentUe.value)) as any;
  // on ne touche pas aux parcours ici
  delete ueToSave.parcours;

  await UeDAO.getInstance().update(currentUe.value.id!, ueToSave);
};

const saveNotes = async () => {
  for (const etu of etudiantsWithNotes.value) {
    const raw = etu.noteValue;
    const hasValue = raw !== null && raw !== '' && raw !== undefined;
    const value = hasValue ? Number(raw) : null;

    if (value !== null && (isNaN(value) || value < 0 || value > 20)) {
      throw new Error(`La note de ${etu.nomComplet} doit être entre 0 et 20`);
    }

    const existingNote = notes.value.find(
      (n) => n.etudiant_id === etu.id && n.ue_id === currentUe.value.id
    );

    if (value === null) {
      if (existingNote) {
        await NoteDAO.getInstance().delete(existingNote.id!);
        notes.value = notes.value.filter((n) => n.id !== existingNote.id);
      }
    } else {
      if (existingNote) {
        existingNote.valeur = value;
        const updated = await NoteDAO.getInstance().update(
          existingNote.id!,
          existingNote
        );
        const idx = notes.value.findIndex((n) => n.id === existingNote.id);
        if (idx !== -1) notes.value[idx] = updated;
      } else {
        const newNote = new Note(
          null,
          value,
          etu.id,
          currentUe.value.id
        );
        const created = await NoteDAO.getInstance().create(newNote);
        notes.value.push(created);
      }
    }
  }

  updateEtudiantsList();
};




import { watch } from 'vue';
import { notify } from '@kyvg/vue3-notification';

watch(() => currentUe.value.intitule, () => {
  if (!currentUe.value.intitule || currentUe.value.intitule.trim() === '' || currentUe.value.intitule.length < 3) {
    formErrors.value.intitule = "L'intitulé doit faire au moins 3 caractères";
  } else {
    formErrors.value.intitule = null;
  }
});

watch(() => currentUe.value.numeroUe, () => {
  if (!currentUe.value.numeroUe || currentUe.value.numeroUe.trim() === '' || currentUe.value.numeroUe.length < 3) {
    formErrors.value.numeroUe = "Le numéro d'UE doit faire au moins 3 caractères";
  } else {
    formErrors.value.numeroUe = null;
  }
});

watch(() => selectedParcours.value, () => {
  updateEtudiantsList();
}, { deep: true });

watch(() => notes.value, () => {
  updateEtudiantsList();
}, { deep: true });

onMounted(() => {
  onLoadData();
});
</script>

<template>
  <div class="container-fluid mt-3 h-100 d-flex flex-column">
    <div class="row flex-grow-1">
      <!-- Colonne gauche -->
      <div class="col-md-6 d-flex flex-column">
        <!-- Bloc UE -->
        <div class="card mb-3">
          <div class="card-header">
            <strong>UE</strong>
          </div>
          <div class="card-body d-flex gap-2">
            <input
              v-model="currentUe.numeroUe"
              type="text"
              class="form-control"
              placeholder="UE_1"
            />
            <input
              v-model="currentUe.intitule"
              type="text"
              class="form-control"
              placeholder="UE_1"
            />
            <CustomButton :disabled="saving || !!formErrors.intitule || !!formErrors.numeroUe" :color="BootstrapButtonEnum.primary" @click="saveUE">
                Enregistrer
            </CustomButton>
          </div>
        </div>

        <!-- Bloc Notes plein hauteur -->
        <div class="card flex-grow-1 d-flex flex-column">
          <div class="card-header">
            <strong>Notes</strong>
          </div>
          <div class="card-body p-0 flex-grow-1 d-flex flex-column">
            <table class="table mb-0">
              <tbody>
                <tr v-for="etudiant in etudiantsWithNotes" :key="etudiant.id!">
                    <td class="align-middle">{{ etudiant.nomComplet }}</td>
                    <td class="text-end" style="width: 120px;">
                        <div class="input-group input-group-sm">
                            <input
                            v-model="etudiant.noteValue"
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            class="form-control text-end"
                            placeholder="__"
                            />
                            <span class="input-group-text">/ 20</span>
                        </div>
                    </td>
                </tr>
                <tr v-if="etudiantsWithNotes.length === 0">
                    <td class="p-3 text-muted" colspan="2">
                    Sélectionnez au moins un parcours pour afficher les étudiants
                    </td>
                </tr>
                </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Colonne droite : Parcours -->
      <div class="col-md-6 d-flex flex-column">
        <div class="card flex-grow-1 d-flex flex-column">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <strong>Parcours</strong>
            <CustomButton :color="BootstrapButtonEnum.success" @click="showAddParcoursModal = true">
                <i class="fa-solid fa-plus"></i>
            </CustomButton>
          </div>
          <div class="card-body p-0 flex-grow-1 d-flex flex-column">
            <ul class="list-group list-group-flush flex-grow-1">
              <li
                v-for="parcours in selectedParcours"
                :key="parcours.id!"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{{ parcours.nomParcours }}</span>
                <button
                  class="btn btn-sm btn-link text-danger"
                  @click="removeParcours(parcours.id)"
                >
                  <i class="fa-solid fa-minus"></i>
                </button>
              </li>
              <li
                v-if="selectedParcours.length === 0"
                class="list-group-item text-muted"
              >
                Aucun parcours sélectionné
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal ajout parcours -->
    <div
      v-if="showAddParcoursModal"
      class="modal d-block"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Ajouter un parcours</h5>
            <button
              type="button"
              class="btn-close"
              @click="showAddParcoursModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="list-group">
              <button
                v-for="parcours in availableParcours"
                :key="parcours.id!"
                type="button"
                class="list-group-item list-group-item-action"
                @click="addParcoursAndClose(parcours)"
              >
                {{ parcours.nomParcours }} ({{ parcours.anneeFormation }})
              </button>
              <div
                v-if="availableParcours.length === 0"
                class="text-muted text-center p-3"
              >
                Tous les parcours sont déjà sélectionnés
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
}
</style>

<style scoped>
.note-icon-btn i {
  color: #fff !important;
}

.list-group-item {
  border: 1px solid #dee2e6;
  padding: 0.75rem 1.25rem;
}

.card {
  border: 1px solid #dee2e6;
}

table {
  margin-bottom: 0;
}

.btn-group-sm {
  display: flex;
  gap: 0.25rem;
}
</style>
