import { PageType } from '../../blog/enums/page-type.enum';
import { Modifier } from './search-criteria';

export interface ICmsAnalytics {
  diseaseID: string[];
  subDiseaseID: string[];
  modifiers: Modifier[];
  subsiteName?: string;
  pageType?: PageType;
  analytics?: any;
}
