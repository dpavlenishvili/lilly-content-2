import { ClientRoutes } from '../../common/client-routes';

export interface MenuImage {
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  link: string;
}

export const MenuImageList: {[key: string]: MenuImage} = {
  [ClientRoutes.Home]: {
    title: $localize`:@@header.home_image_subtitle:Find or Match to a trial`,
    subtitle: $localize`:@@header.home_image_subtitle:Find out how you can help improve future treatments and medical research today.`,
    image: 'assets/images/redesign/Lilly_Moments_People_2520_CMYK 1.webp',
    imageAlt: $localize`:@@images.home_image_alt:Two women in close-up, sharing a gentle moment with their faces touching`,
    link: ClientRoutes.Home
  },
  [ClientRoutes.Listing]: {
    title: $localize`:@@header.listing_image_title:Find A Trial`,
    subtitle: $localize`:@@header.listing_image_subtitle:Your health journey matters, explore clinical trials with us.`,
    image: 'assets/images/redesign/GettyImages-79364857.webp',
    imageAlt: $localize`:@@images.listing_hero_alt:Female patient seated filling out medical forms`,
    link: ClientRoutes.Listing
  },
  [ClientRoutes.Matching]: {
    title: $localize`:@@header.matching_image_title:Match To A Trial`,
    subtitle: $localize`:@@header.matching_image_subtitle:Join a Lilly clinical trial and help shape tomorrow’s treatments.`,
    image: 'assets/images/redesign/GettyImages-1799551345.webp',
    imageAlt: $localize`:@@images.nurse_sitting_alt:Nurse sitting at a table speaking with a female patient`,
    link: ClientRoutes.Matching
  }
};
