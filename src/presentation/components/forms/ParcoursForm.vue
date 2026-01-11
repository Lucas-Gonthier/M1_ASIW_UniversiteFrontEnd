<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Parcours } from '@/domain/entities/Parcours';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO'; 
import CustomModal from '@/presentation/components/modals/CustomModal.vue'; 

const currentParcours = ref<Parcours>(new Parcours(null, null, null));
const isOpen = ref(false);

const openForm = (parcours: Parcours | null = null) => {
    isOpen.value = true;

    if (parcours) {
        currentParcours.value = structuredClone(toRaw(parcours));
    }
};

const closeForm = () => {
    isOpen.value = false;
    currentParcours.value = new Parcours(null, null, null);
};

const emit = defineEmits(['create:parcours', 'update:parcours']); 

const saveParcours = () => { 
  if (formErrors.value.nomParcours || formErrors.value.anneeFormation) {

    return; 

  } 

  if (currentParcours.value.id) { 

    ParcoursDAO.getInstance().update(currentParcours.value.id, currentParcours.value).then(() => { 

      alert('Parcours modifié avec succès'); 
      
      emit('update:parcours', currentParcours.value);
      
      closeForm(); 

    }).catch((ex) => { 

      alert(ex.message); 

    });

  } else { 

    ParcoursDAO.getInstance().create(currentParcours.value).then(() => { 

      alert('Parcours créé avec succès');
      
      emit('create:parcours', currentParcours.value);

      closeForm(); 

    }).catch((ex) => { 

      alert(ex.message); 

    }); 

  } 

}; 

const props = defineProps({
    parcours: {
        type: Object as () => Parcours | null,
        required: false,
        default: null,
    },
});

const formErrors = ref<{ 

  nomParcours: string | null;

  anneeFormation: string | null;

}>({ 

  nomParcours: null,

  anneeFormation: null,

});

watch(() => currentParcours.value.nomParcours, () => { 

  if (!currentParcours.value.nomParcours || currentParcours.value.nomParcours.trim() === '' || currentParcours.value.nomParcours.length < 3) { 

    formErrors.value.nomParcours = 'Le nom du parcours doit faire au moins 3 caractères';

  } else { 

    formErrors.value.nomParcours = null; 

  } 

});

watch(() => currentParcours.value.anneeFormation, () => { 

  if (!currentParcours.value.anneeFormation || currentParcours.value.anneeFormation < 2000 || currentParcours.value.anneeFormation > 2100) {

    formErrors.value.anneeFormation = "L'année de formation doit être comprise entre 2000 et 2100"; 

  } else { 

    formErrors.value.anneeFormation = null; 

  } 

});

onBeforeMount(() => {
    if (props.parcours) {
        currentParcours.value = props.parcours;
    }
});

defineExpose({
    openForm,
    closeForm,
});
</script>

<template> 

  <CustomModal :isOpen="isOpen"> 

    <template v-slot:title> 

      <template v-if="parcours && parcours.id"> Modification du parcours </template> 

      <template v-else> Nouveau parcours </template> 

    </template> 

    <template v-slot:body> 

      <div class="text-start mt-1 mb-1"> 

        <form> 

          <CustomInput v-model="currentParcours.nomParcours" id="intitule" libelle="Intitulé" type="text" 

            placeholder="Intitulé du parcours" :error="formErrors.nomParcours" /> 

          <CustomInput v-model.number="currentParcours.anneeFormation" class="mt-2" id="annee" libelle="Année" type="number"
            placeholder="Année de formation" :error="formErrors.anneeFormation" /> 

        </form> 

      </div> 

      <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger" @click="closeForm"> 

        Annuler 

      </CustomButton> 

      <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary" @click="saveParcours"> 

        Enregistrer 

      </CustomButton> 

    </template> 

  </CustomModal> 

</template> 

<style scoped> 
.custom-modal { 
  position: absolute; 
  left: 0; 
  top: 0; 
  height: 100%; 
  width: 100%; 
  background-color: rgba(87, 86, 86, 0.5); 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  text-align: center; 
} 

.custom-modal .card { 
  width: 250px; 
} 

.card-header { 
  background: #273656; 
  color: white; 
  text-align: left; 
} 

.card-text { 
  text-align: left; 
} 
</style> 