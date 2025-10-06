export interface SearchCriteria {
  diseaseID: string[];
  subDiseaseID: string[];
  modifiers: Modifier[];
}

export interface Modifier {
  partnerCode: string;
  modifierId: string;
  modifier: string;
  diseaseId: string;
  subDiseaseId: string;
}
