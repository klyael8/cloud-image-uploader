import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule]
})
export class AppComponent {
  selectedFile: File | null = null;
  imageSrc: string | ArrayBuffer | null = null;
  isUploading: boolean = false;
  errorMessage: string | null = null;

  // Called when a file is selected
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.errorMessage = null;
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = e.target?.result || null;
      };
      reader.readAsDataURL(file);
    }
  }


  
async uploadImage(): Promise<void> {
  if (!this.selectedFile) {
    alert('Please select an image to upload.');
    return;
  }

  this.isUploading = true;
  this.errorMessage = null;

  try {
    const base64Image = await this.fileToBase64(this.selectedFile);
    const imageBase64 = base64Image.split(',')[1];

    const response = await fetch('https://chkvtqfidenpw4ccyasvmn2wzm0svxdg.lambda-url.eu-north-1.on.aws/', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageBase64 })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    this.imageSrc = result.imageUrl;
    console.log("Uploaded image URL:", result.imageUrl);

  } catch (error) {
    console.error('Error uploading image:', error);
    this.errorMessage = `Error uploading image: ${error instanceof Error ? error.message : String(error)}`;
    alert(this.errorMessage);
  } finally {
    this.isUploading = false;
  }
}


 
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}