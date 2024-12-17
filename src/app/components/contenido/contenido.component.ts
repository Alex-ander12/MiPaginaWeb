import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkWithHref, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-contenido-grupo',
  templateUrl: './contenido.component.html',
  styleUrls: ['./contenido.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ContenidoComponent implements OnInit {
  groupId: string | null = null;
  group: any;
  selectedFile: File | null = null;
  imageBase64: string | null = null;
  postName: string = '';
  posts: any[] = [];  // Arreglo para almacenar las publicaciones

  uploadSuccess: boolean = false;
  uploadError: boolean = false;

  private firestore = inject(Firestore);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Obtener el id del grupo desde la URL
    this.groupId = this.route.snapshot.paramMap.get('id');
    if (this.groupId) {
      // Obtener los detalles del grupo desde Firestore
      const groupRef = doc(this.firestore, 'grupos', this.groupId);
      getDoc(groupRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            this.group = docSnapshot.data();
            this.loadPosts(); // Cargar las publicaciones del grupo
          } else {
            console.log('No se encontró el grupo con ID:', this.groupId);
          }
        })
        .catch((error) => {
          console.error('Error al obtener grupo:', error);
        });
    }
  }

  // Cargar las publicaciones asociadas a este grupo
  async loadPosts(): Promise<void> {
    const postsQuery = query(
      collection(this.firestore, 'posts'),
      where('groupId', '==', this.groupId)
    );
    const querySnapshot = await getDocs(postsQuery);
    this.posts = querySnapshot.docs.map((doc) => doc.data());
  }

  // Manejar selección de archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  // Convertir archivo a base64
  async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Subir la publicación a Firestore
  async uploadFile(): Promise<void> {
    if (!this.selectedFile || !this.postName || !this.groupId) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      this.imageBase64 = await this.convertFileToBase64(this.selectedFile);
      if (this.imageBase64) {
        const postCollection = collection(this.firestore, 'posts');
        await addDoc(postCollection, {
          name: this.postName,
          imageBase64: this.imageBase64,
          createdAt: new Date(),
          groupId: this.groupId, // Asociar la publicación con el grupo
        });
        this.uploadSuccess = true;
        this.loadPosts(); // Recargar las publicaciones después de crear una nueva
        this.resetForm();
      }
    } catch (error) {
      this.uploadError = true;
    }
  }

  // Restablecer el formulario
  resetForm(): void {
    this.postName = '';
    this.selectedFile = null;
    this.imageBase64 = null;
  }
}
