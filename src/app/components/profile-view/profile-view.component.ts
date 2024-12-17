import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css'],
})
export class ProfileViewComponent implements OnInit {
  profileForm!: FormGroup;
  isPublic: boolean = true;
  selectedImage: string | ArrayBuffer | null = null;
  years: number[] = [];
  userId: string = '';  // Aquí almacenas el ID del usuario

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firestore: Firestore,  // Inyección de Firestore
    private auth: Auth
  ) {}

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => 2000 + i);

    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      career: ['', [Validators.required]],
      academicYear: ['', [Validators.required]],
      profilePicture: [null],
      privacy: ['public'],
    });

    // Obtener el usuario actual
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      this.loadProfile(user.uid);  // Cargar el perfil si ya existe
    }
  }

  // Cargar el perfil si ya existe en Firestore
  async loadProfile(userId: string) {
    try {
      const profileRef = doc(this.firestore, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        this.profileForm.patchValue({
          name: profileData?.['name'],
          career: profileData?.['career'],
          academicYear: profileData?.['academicYear'],
          privacy: profileData?.['privacy'],
        });
        this.selectedImage = profileData?.['profilePicture'] || null;
        this.isPublic = profileData?.['privacy'] === 'public';
      }
    } catch (error) {
      console.error('Error cargando el perfil:', error);
    }
  }

  // Guardar el perfil en Firestore
  async saveProfile() {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.value;

      try {
        await this.updateProfileInFirestore(this.userId, profileData);
        console.log('Perfil guardado:', profileData);
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Error al guardar el perfil:', error);
      }
    } else {
      console.error('Formulario inválido');
    }
  }

  // Actualizar el perfil en Firestore
  async updateProfileInFirestore(userId: string, profileData: any) {
    try {
      const profileRef = doc(this.firestore, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);

      const updatedData: any = {};

      // Si la imagen fue modificada, la guardamos
      if (this.selectedImage && this.selectedImage !== profileSnap.data()?.['profilePicture']) {
        updatedData['profilePicture'] = this.selectedImage;
      }

      // Solo actualizamos los campos que hayan cambiado
      updatedData['name'] = profileData['name'];
      updatedData['career'] = profileData['career'];
      updatedData['academicYear'] = profileData['academicYear'];
      updatedData['privacy'] = profileData['privacy'];

      if (profileSnap.exists()) {
        // Actualizar el perfil en Firestore
        await updateDoc(profileRef, updatedData);
        console.log('Perfil actualizado en Firestore');
      } else {
        // Si no existe el perfil, lo creamos
        await setDoc(profileRef, {
          userId,
          name: profileData['name'],
          career: profileData['career'],
          academicYear: profileData['academicYear'],
          profilePicture: this.selectedImage,
          privacy: profileData['privacy'],
        });
        console.log('Perfil creado en Firestore');
      }
    } catch (error) {
      console.error('Error actualizando el perfil:', error);
    }
  }

  togglePrivacy() {
    this.isPublic = !this.isPublic;
    this.profileForm.get('privacy')?.setValue(this.isPublic ? 'public' : 'private');
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.profileForm.patchValue({ profilePicture: file });
      this.profileForm.get('profilePicture')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => this.selectedImage = reader.result;
      reader.readAsDataURL(file);
    }
  }

  resetForm() {
    this.profileForm.reset({
      name: '',
      career: '',
      academicYear: '',
      profilePicture: null,
      privacy: 'public',
    });
    this.selectedImage = null;
    this.isPublic = true;
  }
}
