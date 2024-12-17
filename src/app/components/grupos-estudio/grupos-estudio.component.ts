import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getFirestore, collection, addDoc, updateDoc, doc, arrayUnion, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { BehaviorSubject } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environments';  // Configuración de Firebase
import { Router } from '@angular/router';

@Component({
  selector: 'app-grupos-estudio',
  templateUrl: './grupos-estudio.component.html',
  styleUrls: ['./grupos-estudio.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class GruposEstudioComponent implements OnInit {
  createGroupForm!: FormGroup;
  postForm!: FormGroup;
  groups$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  selectedGroup: any | null = null;
  isModalOpen: boolean = false;
  uploadedFileUrl: string | null = null;
  uploadProgress: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  
  private app = initializeApp(environment.firebaseConfig); // Inicializar Firebase
  private db = getFirestore(this.app); // Firestore
  private storage = getStorage(this.app); // Firebase Storage

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    // Inicialización de formularios
    this.createGroupForm = this.fb.group({
      groupName: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.postForm = this.fb.group({
      content: ['', Validators.required],
      file: ['']
    });

    // Obtener grupos desde Firestore usando onSnapshot
    const groupsRef = collection(this.db, 'grupos');
    onSnapshot(groupsRef, (querySnapshot) => {
      const groups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.groups$.next(groups);  // Emitir datos a través del BehaviorSubject
    });
  }

  // Abrir el modal para crear un grupo
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
    if (this.createGroupForm.valid) {
      const newGroup = this.createGroupForm.value;
      const groupsRef = collection(this.db, 'grupos');
      addDoc(groupsRef, newGroup)
        .then(() => {
          console.log('Grupo creado:', newGroup);
          this.closeModal();
        })
        .catch((error) => {
          console.error('Error al crear grupo:', error);
        });
    }
  }

  // Seleccionar un grupo para ver su feed
  selectGroup(group: any) {
    this.selectedGroup = group;
    this.router.navigate(['/grupo', group.id]);  // Navegar a la página de detalles del grupo
  }

  // Agregar una publicación al feed de un grupo
  addPost() {
    if (this.postForm.valid && this.selectedGroup) {
      const newPost = {
        content: this.postForm.value.content,
        fileUrl: this.uploadedFileUrl || null,
        timestamp: serverTimestamp()
      };

      const groupRef = doc(this.db, 'grupos', this.selectedGroup.id);
      updateDoc(groupRef, {
        feed: arrayUnion(newPost)  // Agregar el nuevo post al array de publicaciones
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
      const fileRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(fileRef, file);

      // Monitorear el progreso de la carga
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.uploadProgress.next(progress);  // Emitir progreso usando BehaviorSubject
        },
        (error) => {
          console.error('Error de carga:', error);
        },
        () => {
          // Cuando la carga termine
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            this.uploadedFileUrl = url;
            console.log('Archivo subido con URL:', url);
          });
        }
      );
    }
  }
}
