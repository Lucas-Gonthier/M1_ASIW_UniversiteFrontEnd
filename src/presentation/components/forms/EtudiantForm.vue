<script setup lang="ts">
import { ref, onBeforeMount, watch, toRaw } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Etudiant } from '@/domain/entities/Etudiant';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import type { Parcours } from '@/domain/entities/Parcours';

const currentEtudiant = ref<Etudiant>(new Etudiant(null, null, null, null, null));
const isOpen = ref(false);
const formErrors = ref<{
    nom: string | null;
    prenom: string | null;
    email: string | null;
    parcours: string | null;
}>({
    nom: null,
    prenom: null,
    email: null,
    parcours: null,
});

const parcoursOptions = ref<Parcours[]>([]);

const openForm = (etudiant: Etudiant | null = null) => {
    isOpen.value = true;
    if (etudiant) {
        currentEtudiant.value = structuredClone(toRaw(etudiant));
    }
};

const closeForm = () => {
    isOpen.value = false;
    currentEtudiant.value = new Etudiant(null, null, null, null, null);
};

const saveEtudiant = () => {
    if (formErrors.value.nom || formErrors.value.prenom || formErrors.value.email) {
        return;
    }

    if (currentEtudiant.value.id) {
        // update existing etudiant
        EtudiantDAO.getInstance()
            .update(currentEtudiant.value.id, currentEtudiant.value as any)
            .then((updated) => {
                alert('Étudiant modifié avec succès');
                emit('update:etudiant', updated);
                closeForm();
            })
            .catch((ex: any) => {
                alert(ex.message || ex);
            });
    } else {
        EtudiantDAO.getInstance()
            .create(currentEtudiant.value as any)
            .then((newEtudiant) => {
                alert('Étudiant créé avec succès');
                emit('create:etudiant', newEtudiant);
                closeForm();
            })
            .catch((ex: any) => {
                alert(ex.message || ex);
            });
    }
};

const props = defineProps({
    etudiant: {
        type: Object as () => Etudiant | null,
        required: false,
        default: null,
    },
});

const emit = defineEmits(['create:etudiant', 'update:etudiant']);

onBeforeMount(() => {
    if (props.etudiant) {
        currentEtudiant.value = structuredClone(toRaw(props.etudiant));
    }

    // Chargement de la liste des parcours
    ParcoursDAO.getInstance().list().then((parcours) => {
        parcoursOptions.value = parcours;
    });
});

defineExpose({
    openForm,
    closeForm,
});

watch(() => props.etudiant, (newEtudiant) => {
    if (newEtudiant) {
        currentEtudiant.value = structuredClone(toRaw(newEtudiant));
        openForm();
    }
});

watch(() => currentEtudiant.value.nom, () => {
    if (!currentEtudiant.value.nom || currentEtudiant.value.nom.trim() === '' || currentEtudiant.value.nom.length < 2) {
        formErrors.value.nom = "Le nom doit faire au moins 2 caractères";
    } else {
        formErrors.value.nom = null;
    }
});

watch(() => currentEtudiant.value.prenom, () => {
    if (!currentEtudiant.value.prenom || currentEtudiant.value.prenom.trim() === '' || currentEtudiant.value.prenom.length < 2) {
        formErrors.value.prenom = "Le prénom doit faire au moins 2 caractères";
    } else {
        formErrors.value.prenom = null;
    }
});

watch(() => currentEtudiant.value.email, () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!currentEtudiant.value.email || !emailRegex.test(currentEtudiant.value.email)) {
        formErrors.value.email = "L'email doit être valide";
    } else {
        formErrors.value.email = null;
    }
});
</script>

<template>
    <CustomModal :isOpen="isOpen">
        <template v-slot:title>
            <template v-if="currentEtudiant.id">Modification de l'étudiant</template>
            <template v-else>Nouvel étudiant</template>
        </template>

        <template v-slot:body>
            <div class="text-start mt-1 mb-1">
                <form>
                    <CustomInput v-model="currentEtudiant.nom" class="mt-2" id="nom" libelle="Nom" type="text" placeholder="Nom de l'étudiant" :error="formErrors.nom" />
                    <CustomInput v-model="currentEtudiant.prenom" id="prenom" libelle="Prénom" type="text" placeholder="Prénom de l'étudiant" :error="formErrors.prenom" />
                    <CustomInput v-model="currentEtudiant.email" id="email" libelle="Email" type="email" placeholder="Email de l'étudiant" :error="formErrors.email" />
                    <div class="form-group">
                        <label for="parcours">Parcours :</label>
                        <v-select label="nomParcours" v-model="currentEtudiant.parcours" :options="parcoursOptions"></v-select>
                        <div v-if="formErrors.parcours" class="invalid-feedback">
                            {{ formErrors.parcours }}
                        </div>
                    </div>
                </form>
            </div>

            <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger" @click="closeForm">
                Annuler
            </CustomButton>

            <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary" @click="saveEtudiant">
                Enregistrer
            </CustomButton>
        </template>
    </CustomModal>
</template>
