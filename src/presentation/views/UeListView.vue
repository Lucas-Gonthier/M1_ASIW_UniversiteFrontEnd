<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import UeForm from '@/presentation/components/forms/UeForm.vue';
import CustomTable from '../components/tables/CustomTable.vue';
import { UE } from '@/domain/entities/Ue';
import { UeDAO } from '@/domain/daos/UeDAO';
import Swal from 'sweetalert2';

const ueForm = ref<typeof UeForm | null>(null);

const ues = ref<UE[]>([]);

const formatterEdition = (ue: UE) => {
  return '<i class="bi bi-pen-fill text-primary"></i>';
};

const formatterSuppression = (ue: UE) => {
  return '<i class="bi bi-trash-fill text-danger"></i>';
};

const onUeCreated = (newUe: UE) => {
  ues.value.unshift(newUe);
};

const onUeUpdated = (updatedUe: UE) => {
  const index = ues.value.findIndex(u => u.id === updatedUe.id);
  if (index !== -1) ues.value[index] = updatedUe;
};

const onDeleteUe = (u: UE) => {
  Swal.fire({
    title: "Êtes-vous sûr de vouloir supprimer cette UE ?",
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler',
  }).then((result) => {
    if (result.isConfirmed) {
      UeDAO.getInstance()
        .delete(u.id!)
        .then(() => {
          ues.value = ues.value.filter(item => item.id !== u.id);
        })
        .catch(() => {
          alert("Une erreur est survenue lors de la suppression de l'UE");
        });
    }
  });
};

const columns = [
  { field: 'editionUe', label: 'Edition', formatter: formatterEdition, onClick: (u: UE) => { ueForm.value?.openForm(u); }, style: 'width: 32px;text-align:center;' },
  { field: 'id', label: 'ID', formatter: null, onClick: null, style: '' },
  { field: 'numeroUe', label: 'Numéro', formatter: null, onClick: null, style: '' },
  { field: 'intitule', label: 'Intitulé', formatter: null, onClick: null, style: '' },
  { field: 'deleteUe', label: 'Suppression', formatter: formatterSuppression, onClick: onDeleteUe, style: 'width: 32px;text-align:center;' },
];

onMounted(() => {
  UeDAO.getInstance().list().then((data) => {
    ues.value = data;
  });
});
</script>

<template>

  <div class="container-fluid">

    <div class="card mt-5">

      <div class="card-header">

        <div class="card-title">

          <h4>Liste des UEs</h4>

        </div>

        <CustomButton :color="BootstrapButtonEnum.info" @click="ueForm?.openForm()">
          Ajouter une UE
        </CustomButton>

      </div>

        <div class="card-body">

        <CustomTable idAttribute="id" :columns="columns" :data="ues" />

      </div>

    </div>

  </div>

  <UeForm ref="ueForm" @create:ue="onUeCreated" @update:ue="onUeUpdated" />

</template>