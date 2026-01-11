<script setup lang="ts"> 

import { ref, onBeforeMount, watch, toRaw } from 'vue'; 

import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum'; 

import { UE } from '@/domain/entities/Ue'; 

import CustomInput from '@/presentation/components/forms/components/CustomInput.vue'; 

import CustomButton from '@/presentation/components/forms/components/CustomButton.vue'; 

import CustomModal from '@/presentation/components/modals/CustomModal.vue'; 

import { UeDAO } from '@/domain/daos/UeDAO'; 

import { ParcoursDAO } from '@/domain/daos/ParcoursDAO'; 

import type { Parcours } from '@/domain/entities/Parcours'; 

 

const currentUe = ref<UE>(new UE(null, null, null, null)); 

const isOpen = ref(false); 

const formErrors = ref<{
    numeroUe: string | null;
    intitule: string | null;
    parcours: string | null;
}>({
    numeroUe: null,
    intitule: null,
    parcours: null,
});

 

const parcoursOptions = ref<Parcours[]>([]); 

 

const openForm = (ue: UE | null = null) => { 

    isOpen.value = true; 

    if (ue) { 

        currentUe.value = structuredClone(toRaw(ue)); 

    } 

}; 

 

const closeForm = () => { 

    isOpen.value = false; 

    currentUe.value = new UE(null, null, null, null); 

}; 

 

const saveUE = () => { 

    if (formErrors.value.intitule || formErrors.value.numeroUe) {
        return;
    }

 

    if (currentUe.value.id) {
        // update existing UE
        UeDAO.getInstance()
            .update(currentUe.value.id, currentUe.value as any)
            .then((updated) => {
                alert('UE modifiée avec succès');
                emit('update:ue', updated);
                closeForm();
            })
            .catch((ex: any) => {
                alert(ex.message || ex);
            });
    } else {
        UeDAO.getInstance()
            .create(currentUe.value as any)
            .then((newUE) => {
                alert('UE créée avec succès');
                emit('create:ue', newUE);
                closeForm();
            })
            .catch((ex: any) => {
                alert(ex.message || ex);
            });
    }

}; 

 

const props = defineProps({ 

    ue: { 

        type: Object as () => UE | null, 

        required: false, 

        default: null, 

    }, 

}); 

 

const emit = defineEmits(['create:ue', 'update:ue']); 

 

onBeforeMount(() => { 

    if (props.ue) { 

        currentUe.value = structuredClone(toRaw(props.ue)); 

    } 

 

    // Chargement de la liste des parcours 

    ParcoursDAO.getInstance().list().then((parcours) => { 

        parcoursOptions.value = parcours 

    }); 

}); 

 

defineExpose({ 

    openForm, 

    closeForm, 

}); 

 

watch(() => props.ue, (newUE) => { 

    if (newUE) { 

        currentUe.value = structuredClone(toRaw(newUE)); 

        openForm(); 

    } 

}); 

 

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

</script> 

 

<template> 

    <CustomModal :isOpen="isOpen"> 

        <template v-slot:title> 

            <template v-if="currentUe.id"> Modification de l'UE</template> 

            <template v-else> Nouvelle UE</template> 

        </template> 

        <template v-slot:body> 

            <div class="text-start mt-1 mb-1"> 

                <form> 

                    <CustomInput v-model="currentUe.numeroUe" class="mt-2" id="numeroue" libelle="Numéro" type="text" placeholder="Numéro d'UE" :error="formErrors.numeroUe" /> 

                    <CustomInput v-model="currentUe.intitule" id="intitule" libelle="Intitulé" type="text" placeholder="Intitulé de l'UE" :error="formErrors.intitule" /> 
                    <div class="form-group"> 

                        <label for="intitule">Parcours :</label> 

                        <v-select multiple label="nomParcours" v-model="currentUe.parcours" :options="parcoursOptions"></v-select> 

                        <div v-if="formErrors.parcours" class="invalid-feedback"> 

                            {{ formErrors.parcours }} 

                        </div> 

                    </div> 

                </form> 

            </div> 

            <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger" @click="closeForm"> 

                Annuler 

            </CustomButton> 

            <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary" @click="saveUE"> 

                Enregistrer 

            </CustomButton> 

        </template> 

    </CustomModal> 

</template> 