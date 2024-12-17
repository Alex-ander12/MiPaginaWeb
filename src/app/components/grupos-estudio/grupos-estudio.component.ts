import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';  // Importar Firebase
import { Observable } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';  // Importar ReactiveFormsModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grupos-estudio',
  templateUrl: './grupos-estudio.component.html',
  styleUrls: ['./grupos-estudio.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule]
  
})
export class GruposEstudioComponent implements OnInit {
  createGroupForm!: FormGroup;  // Usar el operador de no null assertion (!)
  postForm!: FormGroup;
  groups: Observable<any[]> | null = null;
  selectedGroup: any | null = null;
  isModalOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore
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
    this.groups = this.firestore.collection('grupos').valueChanges();
  }

  openModal() {
    this.isModalOpen = true; // Mostrar modal
  }

  closeModal() {
    this.isModalOpen = false;  // Ocultar modal
  }

  onSubmit() {
    if (this.createGroupForm?.valid) {
      const newGroup = this.createGroupForm.value;
      // Guardar el nuevo grupo en Firebase
      this.firestore.collection('grupos').add(newGroup).then(() => {
        console.log('Grupo creado:', newGroup);
        this.closeModal();
      }).catch((error) => {
        console.error('Error al crear grupo:', error);
      });
    }
  }

  viewGroup(group: any) {
    this.selectedGroup = group;
  }

  addPost() {
    if (this.postForm?.valid && this.selectedGroup) {
      const newPost = {
        content: this.postForm.value.content,
        fileUrl: this.postForm.value.file
      };

      // Aquí puedes agregar el post al feed del grupo seleccionado
      const groupRef = this.firestore.collection('grupos').doc(this.selectedGroup.id);
      groupRef.update({
        feed: firebase.firestore.FieldValue.arrayUnion(newPost)  // Esto agrega el post al feed
      }).then(() => {
        console.log('Post agregado:', newPost);
        this.postForm.reset();
      }).catch((error) => {
        console.error('Error al agregar post:', error);
      });
    }
  }

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.postForm?.patchValue({ file: file.name });  // Aquí puedes subir el archivo a Firebase Storage si lo necesitas
      console.log('Archivo cargado:', file.name);
    }
  }
}
