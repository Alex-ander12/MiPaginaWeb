import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Importar AngularFireStorage
import firebase from 'firebase/compat/app'; // Importar Firebase
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grupos-estudio',
  templateUrl: './grupos-estudio.component.html',
  styleUrls: ['./grupos-estudio.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class GruposEstudioComponent implements OnInit {
  createGroupForm!: FormGroup; // Usar el operador de no null assertion (!)
  postForm!: FormGroup;
  groups: Observable<any[]> | null = null;
  selectedGroup: any | null = null;
  isModalOpen: boolean = false;
  uploadProgress: Observable<number | undefined> | null = null; // Para mostrar progreso de carga del archivo
  uploadedFileUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage // Inyectar AngularFireStorage para manejar archivos
  ) {}

  ngOnInit(): void {
    // Inicializar formularios
    this.createGroupForm = this.fb.group({
      groupName: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.postForm = this.fb.group({
      content: ['', Validators.required],
      file: ['']
    });

    // Obtener los grupos de Firebase
    this.groups = this.firestore.collection('grupos').valueChanges({ idField: 'id' });
  }

  // Abrir el modal
  openModal() {
    this.isModalOpen = true;
  }

  // Cerrar el modal
  closeModal() {
    this.isModalOpen = false;
    this.createGroupForm.reset();
  }

  // Crear un nuevo grupo
  onSubmit() {
    if (this.createGroupForm?.valid) {
      const newGroup = this.createGroupForm.value;
      // Guardar el nuevo grupo en Firebase
      this.firestore.collection('grupos').add(newGroup)
        .then(() => {
          console.log('Grupo creado:', newGroup);
          this.closeModal();
        })
        .catch((error) => {
          console.error('Error al crear grupo:', error);
        });
    }
  }

  // Seleccionar un grupo
  viewGroup(group: any) {
    this.selectedGroup = group;
  }

  // Agregar una publicación al grupo seleccionado
  addPost() {
    if (this.postForm?.valid && this.selectedGroup) {
      const newPost = {
        content: this.postForm.value.content,
        fileUrl: this.uploadedFileUrl || null, // Asignar la URL del archivo si se subió
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      const groupRef = this.firestore.collection('grupos').doc(this.selectedGroup.id);

      groupRef.update({
        feed: firebase.firestore.FieldValue.arrayUnion(newPost)
      }).then(() => {
        console.log('Post agregado:', newPost);
        this.postForm.reset();
        this.uploadedFileUrl = null;
      }).catch((error) => {
        console.error('Error al agregar post:', error);
      });
    }
  }

  // Subir archivo a Firebase Storage
  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, file);

      // Monitorear progreso de la subida
      this.uploadProgress = uploadTask.percentageChanges();

      // Obtener URL del archivo subido
      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.uploadedFileUrl = url;
            console.log('Archivo subido con URL:', url);
          });
        })
      ).subscribe();
    }
  }
}
