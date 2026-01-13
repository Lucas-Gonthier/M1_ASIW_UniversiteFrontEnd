<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import EtudiantForm from '@/presentation/components/forms/EtudiantForm.vue';
import CustomTable from '../components/tables/CustomTable.vue';
import { Etudiant } from '@/domain/entities/Etudiant';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import Swal from 'sweetalert2';

const etudiantForm = ref<typeof EtudiantForm | null>(null);

const etudiants = ref<Etudiant[]>([]);

const formatterEdition = (etudiant: Etudiant) => {
  return '<i class="bi bi-pen-fill text-primary"></i>';
};

const formatterSuppression = (etudiant: Etudiant) => {
  return '<i class="bi bi-trash-fill text-danger"></i>';
};

const onEtudiantCreated = (newEtudiant: Etudiant) => {
  etudiants.value.unshift(newEtudiant);
};

const onEtudiantUpdated = (updatedEtudiant: Etudiant) => {
  const index = etudiants.value.findIndex(e => e.id === updatedEtudiant.id);
  if (index !== -1) etudiants.value[index] = updatedEtudiant;
};

const onDeleteEtudiant = (e: Etudiant) => {
  Swal.fire({
    title: "Êtes-vous sûr de vouloir supprimer cet étudiant ?",
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler',
  }).then((result) => {
    if (result.isConfirmed) {
      EtudiantDAO.getInstance()
        .delete(e.id!)
        .then(() => {
          etudiants.value = etudiants.value.filter(item => item.id !== e.id);
        })
        .catch(() => {
          alert("Une erreur est survenue lors de la suppression de l'étudiant");
        });
    }
  });
};

const columns = [
  { field: 'editionEtudiant', label: 'Edition', formatter: formatterEdition, onClick: (e: Etudiant) => { etudiantForm.value?.openForm(e); }, style: 'width: 32px;text-align:center;' },
  { field: 'id', label: 'ID', formatter: null, onClick: null, style: '' },
  { field: 'nom', label: 'Nom', formatter: null, onClick: null, style: '' },
  { field: 'prenom', label: 'Prénom', formatter: null, onClick: null, style: '' },
  { field: 'email', label: 'Email', formatter: null, onClick: null, style: '' },
  { field: 'nomParcours', label: 'Parcours', formatter: (e: Etudiant) => e.parcours?.nomParcours || '-', onClick: null, style: '' },
  { field: 'deleteEtudiant', label: 'Suppression', formatter: formatterSuppression, onClick: onDeleteEtudiant, style: 'width: 32px;text-align:center;' },
];

onMounted(() => {
  EtudiantDAO.getInstance().list().then((data) => {
    console.log('Étudiants récupérés:', data);
    etudiants.value = data;
  });
});
</script>

<template>

  <div class="container-fluid">

    <div class="card mt-5">

      <div class="card-header">

        <div class="card-title">

          <h4>Liste des étudiants</h4>

        </div>

        <CustomButton :color="BootstrapButtonEnum.info" @click="etudiantForm?.openForm()">
          Ajouter un étudiant
        </CustomButton>

      </div>

        <div class="card-body">

        <CustomTable idAttribute="id" :columns="columns" :data="etudiants" />

      </div>

    </div>

  </div>

  <EtudiantForm ref="etudiantForm" @create:etudiant="onEtudiantCreated" @update:etudiant="onEtudiantUpdated" />

</template>
