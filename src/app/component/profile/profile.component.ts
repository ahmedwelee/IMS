import { Component } from '@angular/core';
import { Profile, DefaultProfile, SocialLink, SocialPlatforms } from './profile-data';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  // Profile data
  profile: Profile = { ...DefaultProfile };
  isEditing = false;
  socialPlatforms = SocialPlatforms;

  // Temporary editing state
  editProfile: Profile = { ...DefaultProfile };
  newSkill = '';
  newSocialLink = { platform: '', url: '' };

  // Start editing
  startEditing(): void {
    this.editProfile = { ...this.profile };
    this.isEditing = true;
  }

  // Cancel editing
  cancelEditing(): void {
    this.isEditing = false;
  }

  // Save profile changes
  saveProfile(): void {
    this.profile = { ...this.editProfile };
    this.isEditing = false;
  }

  // Add a new skill
  addSkill(): void {
    const skill = this.newSkill.trim();
    if (skill && !this.editProfile.skills.includes(skill)) {
      this.editProfile.skills = [...this.editProfile.skills, skill];
      this.newSkill = '';
    }
  }

  // Remove a skill
  removeSkill(skill: string): void {
    this.editProfile.skills = this.editProfile.skills.filter(s => s !== skill);
  }

  // Add a new social link
  addSocialLink(): void {
    const link = this.newSocialLink;
    if (link.platform && link.url) {
      const platform = this.socialPlatforms.find(p => p.name === link.platform);
      if (platform) {
        const newLink: SocialLink = {
          platform: link.platform,
          url: link.url,
          icon: platform.icon
        };

        this.editProfile.socialLinks = [...this.editProfile.socialLinks, newLink];
        this.newSocialLink = { platform: '', url: '' };
      }
    }
  }

  // Remove a social link
  removeSocialLink(platform: string): void {
    this.editProfile.socialLinks = this.editProfile.socialLinks.filter(link => link.platform !== platform);
  }

  // Handle avatar upload (simulated)
  onAvatarUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editProfile.avatar = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // Get social icon class
  getSocialIcon(platform: string): string {
    const social = this.socialPlatforms.find(p => p.name === platform);
    return social ? social.icon : 'fas fa-link';
  }
}
