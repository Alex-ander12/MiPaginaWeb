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
  userId: string = '';  // ID del usuario actual
  maxFileSizeMB = 2;   // Tamaño máximo del archivo en MB

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 2024 - 2004 + 1 }, (_, i) => 2004 + i);

    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      career: ['', [Validators.required]],
      academicYear: ['', [Validators.required]],
      profilePicture: [null],
      privacy: ['public'],
    });

    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      this.loadProfile(user.uid);
    }
  }

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

  async saveProfile() {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.value;

      try {
        await this.updateProfileInFirestore(this.userId, profileData);
        alert('Perfil guardado exitosamente');
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Error al guardar el perfil:', error);
        alert('Error al guardar el perfil. Por favor, inténtalo de nuevo.');
      }
    } else {
      console.error('Formulario inválido');
    }
  }

  async updateProfileInFirestore(userId: string, profileData: any) {
    try {
      const profileRef = doc(this.firestore, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);

      const updatedData: any = {
        name: profileData['name'],
        career: profileData['career'],
        academicYear: profileData['academicYear'],
        privacy: profileData['privacy'],
      };

      if (this.selectedImage && this.selectedImage !== profileSnap.data()?.['profilePicture']) {
        updatedData['profilePicture'] = this.selectedImage;
      }

      if (profileSnap.exists()) {
        await updateDoc(profileRef, updatedData);
      } else {
        await setDoc(profileRef, { userId, ...updatedData });
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
      // Validar que el archivo es una imagen y no excede el tamaño permitido
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }

      if (file.size > this.maxFileSizeMB * 1024 * 1024) {
        alert(`El archivo no debe exceder ${this.maxFileSizeMB} MB.`);
        return;
      }

      this.profileForm.patchValue({ profilePicture: file });
      this.profileForm.get('profilePicture')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => (this.selectedImage = reader.result);
      reader.readAsDataURL(file);
    }
  }

  resetForm() {
    if (confirm('¿Estás seguro de que deseas resetear el formulario?')) {
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
}
