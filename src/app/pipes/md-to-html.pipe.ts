import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer } from '@angular/platform-browser';
import { LinkBehavior } from '@careboxhealth/core';
import { ConfigurationProvider, LanguageCode } from '@careboxhealth/core';

export const MD_TO_HTML_PIPE_LINK_CLASS = 'md-to-html-pipe-link';
export const MD_TO_HTML_PIPE_LINK_DATA_ATTRIBUTE = 'data-link-behavior';
export const MD_TO_HTML_PIPE_STRONG_CLASS = 'md-to-html-pipe-strong';
export const ANALYTICS_OBJ_ATTRIBUTE = 'analytics-obj';

export const CB_GTM_EVENT = 'cbgtmevent';
export const ARIA_LABEL = 'aria-label';


@Pipe({
  name: 'mdToHtml',
  standalone: true
})
export class MdToHtmlPipe implements PipeTransform {
  gtmEvent = '';
  /* eslint-disable @typescript-eslint/no-explicit-any */
  analyticsObj: any;

  constructor(
    private sanitizer: DomSanitizer,
    protected configuration: ConfigurationProvider,
  ) {
  }
  transform(value: string, analyticsObj: any = {}) {
    this.analyticsObj = analyticsObj;
    return value ? this.sanitizer.bypassSecurityTrustHtml(this.applyConfig(marked(value))) : '';
  }

  applyConfig(str) {
    return this.applyStrongConfig(this.applyLinkConfig(str));
  }

  applyLinkConfig(str: string): string {
    // This regexp helps us find this kind of template: <a attributes>content</a>{config}
    // For example: <a href="#">Find a Trial</a>{linkBehavior="sameTab"}
    const regexp = /<a(?:[\s]+([^>]+))?>((?:.(?!<\/a>))*.)<\/a>({[^}]+})?/g;
    return str.replace(regexp, (match, attributes, content, config) => {
      let linkBehaviorValue: LinkBehavior;
      let gtmEvent = '';
      let ariaLabelValue = '';
      if (config) {
        const ariaLabel = config.match(/ariaLabel=(?:["'”“’‘]|&quot;)(.+?)(?:["'”“’‘]|&quot;)/);
        ariaLabelValue = ariaLabel?.length ? ariaLabel[1] : '';

        config = config.replace(/\s/g, '');

        gtmEvent = config.match(/cbgtmevent=(?:["'”“’‘]|&quot;)(\w*)(?:["'”“’‘]|&quot;)/);
        gtmEvent = gtmEvent && gtmEvent.length ? gtmEvent[1] : '';

        // This regexp helps us to find all quotation marks
        const linkBehavior = config.match(/linkBehavior=(?:["'”“’‘]|&quot;)(\w*)(?:["'”“’‘]|&quot;)/) ||
                              config.match(/link-type=(?:["'”“’‘]|&quot;)(\w*)(?:["'”“’‘]|&quot;)/) || [];
        linkBehaviorValue = linkBehavior.length ? linkBehavior[1] : '';
      }
      return this.buildLink(attributes, linkBehaviorValue, content, gtmEvent, ariaLabelValue);
    });
  }

  buildLink(attributes: string, linkBehaviorValue: LinkBehavior, content: string, gtmEventValue: string, ariaLabelValue: string): string {
    let comingClass;
    const gtmEventString = gtmEventValue ? `${CB_GTM_EVENT}="${gtmEventValue}"` : '';
    const ariaLabelString = ariaLabelValue ? `${ARIA_LABEL}="${ariaLabelValue}"` : '';
    const href = attributes.match(/href="(.*?)"/);
    let hrefValue = href.length ? href[1] : '';

    if (!linkBehaviorValue){
      const href = attributes.match(/href="(.*?)"/);
      const hrefValue = href.length ? href[1] : '';

      if (hrefValue[0] === '/') {
        linkBehaviorValue = LinkBehavior.SameTab;
      } else {
        linkBehaviorValue = LinkBehavior.Interstitial;
      }
    }


    // We need it, because when we use relative paths we do not catch clicks on links with relative paths.
    // And as result we don't use internal navigation by means of angular which causes page reload
    if (!hrefValue.startsWith('https://') && !hrefValue.startsWith('http://') && hrefValue[0] !== '/') {
      const newHrefValue = '/' + hrefValue;
      attributes = attributes.replace(hrefValue, newHrefValue);
      hrefValue = newHrefValue;
    }

    if (
      hrefValue[0] === '/' && !hrefValue.startsWith('//') &&
      Object.keys(LanguageCode).every(language => !hrefValue.toLowerCase().startsWith('/' + language.toLowerCase()))
    ) {
      // We need to add country code, because otherwise during SEO indexer navigates to url without country code.
      // It causes getting 301 during navigation, which is bad
      const countryCode = this.configuration.defaultCultureCode;
      attributes = attributes.replace(hrefValue, `/${countryCode}` + hrefValue);
    }

    const attributesWithoutClass = attributes.replace(/class="(.*?)"/, (match, classValue) => {
      comingClass = classValue;
      return '';
    });

    if (Object.keys(this.analyticsObj || {}).length) {
      setTimeout(() => {                                                                            // we need to setAattribute after data will render
        const href = attributes.match(/href="(.*?)"/);
        const elms = this.analyticsObj.elementRef.nativeElement.querySelectorAll('[' + href[0] + ']');
        elms.forEach(element => {
          this.analyticsObj.analytics = {
            linkText: element?.innerText,
            linkUrl: element?.href,
            ...this.analyticsObj.analytics
          };
          element.setAttribute(
            ANALYTICS_OBJ_ATTRIBUTE,
            JSON.stringify(this.analyticsObj.analytics)
          ); // browser cuts objects value on space char if you return in string
        });
      }, 0);
    }

    // eslint-disable-next-line max-len
    return `<a class="${MD_TO_HTML_PIPE_LINK_CLASS}${comingClass ? ' ' + comingClass : ''}" ${attributesWithoutClass} ${MD_TO_HTML_PIPE_LINK_DATA_ATTRIBUTE}="${linkBehaviorValue}" ${gtmEventString} ${ariaLabelString}>${content}</a>`;
  }

  applyStrongConfig(str: string): string {
    // This regexp helps us find this kind of templates:
    // <strong description="Some description">content</strong>
    // <strong>content</strong>{description="Some description"}
    // <strong>content</strong>
    const regexp = /<strong(?:\sdescription="([^>]+)")?[^>]*>((?:.(?!<\/strong>))*.)<\/strong>(?:{description=&quot;([^}]+)&quot;})?/g;

    return str.replace(regexp, (match, descriptionAttribute, content, descriptionJson) => {
      const description = descriptionAttribute || descriptionJson;

      if (!description) {
        return match;
      }

      return (
        '<span class="' + MD_TO_HTML_PIPE_STRONG_CLASS + '" tabindex="0" aria-label="' + description +'">' +
        content +
        '<span class="d-none" tabindex="0"> ' + description + ' </span>' +
        '<svg id="b" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" height="16px"><path id="c" d="M12,21.96325c-5.50255,0-9.96325-4.4607-9.96325-9.96325S6.49745,2.03675,12,2.03675s9.96325,4.4607,9.96325,9.96325c-.00618,5.49999-4.46326,9.95707-9.96325,9.96325Zm-2.03998-10.8587c.24037-.02873,.48297,.03104,.68248,.16813,.1386,.16959,.20402,.38737,.18183,.60527-.00259,.17996-.02218,.35926-.05853,.53553-.03487,.17685-.08095,.37362-.14322,.61274l-.64388,2.26913c-.05978,.24908-.09839,.45706-.12454,.63889-.02341,.18424-.03547,.36974-.03612,.55545-.01189,.44218,.1767,.86604,.51311,1.15325,.41031,.32684,.92734,.48971,1.4509,.45706,.3607,.00622,.71986-.04852,1.06233-.1619,.32256-.11333,.73479-.26776,1.22672-.4608l.17436-.69992c-.13927,.05739-.28244,.10484-.42842,.14198-.17157,.05097-.34913,.07903-.52805,.08344-.24508,.0243-.49129-.03353-.69992-.16439-.15494-.16413-.22887-.38866-.20176-.61274,.00625-.17743,.02707-.35404,.06227-.52805,.05355-.27274,.09714-.46329,.14447-.6227l.63889-2.25792c.06352-.22335,.10523-.45233,.12454-.68373,.01993-.24036,.03363-.41846,.03363-.51933,.01449-.44131-.16807-.86621-.49816-1.15947-.40324-.32109-.91161-.48049-1.42599-.4471-.36988,.00468-.73674,.0673-1.08724,.18557-.43465,.14073-.82944,.28395-1.20555,.44087l-.16315,.69245c.14571-.05231,.29516-.10212,.44212-.1482,.16484-.04737,.33537-.07209,.50688-.07348Zm2.92297-5.23071c-.39992-.00608-.78674,.14249-1.07977,.41472-.28671,.25729-.44985,.6248-.44835,1.01002-.00308,.38519,.16037,.75295,.44835,1.00878,.61276,.55403,1.54553,.55403,2.15829,0,.2864-.25655,.44803-.6243,.44336-1.00878,.00309-.38451-.15824-.75203-.44336-1.01002-.29233-.27283-.67869-.42229-1.07852-.41721v.00249Z"/></svg>' +
        '</span>'
      );
    });
  }
}
