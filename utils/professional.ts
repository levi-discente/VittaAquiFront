import { ProfessionalProfile } from '@/types/professional';

export function isProfileIncomplete(profile: ProfessionalProfile): boolean {
  return (
    !profile.bio ||
    !profile.category ||
    !profile.profissionalIdentification ||
    !profile.services.length ||
    !profile.price ||
    !profile.availableDaysOfWeek.length ||
    !profile.startHour ||
    !profile.endHour
  );
}
