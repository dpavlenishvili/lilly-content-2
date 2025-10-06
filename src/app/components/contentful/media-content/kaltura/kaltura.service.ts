import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

declare const window;

@Injectable({
  providedIn: 'root'
})
export class KalturaService {
  private readonly kalturaScriptId = 'kalturaLib';
  private kalturaScriptLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private scriptLoadedStarted = false;
  public kalturaScriptLoaded$: Observable<boolean> = this.kalturaScriptLoaded.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  public loadKalturaScript(partnerId: string, configId: string): void {
    if (this.scriptLoadedStarted) {
      return;
    }
    this.scriptLoadedStarted = true;
    if (this.document.getElementById(this.kalturaScriptId)) {
      return;
    }

    const src = `//cdnapisec.kaltura.com/p/${partnerId}/sp/${partnerId}00/embedIframeJs/uiconf_id/${configId}/partner_id/${partnerId}`;
    const node = this.document.createElement('script');

    node.id = this.kalturaScriptId;
    node.src = src;
    node.title = 'Kaltura widget';
    node.type = 'text/javascript';
    node.async = false;
    node.charset = 'utf-8';

    node.onload = () => {
      this.redeclareKaltura();
      this.kalturaScriptLoaded.next(true);
    };

    this.document.getElementsByTagName('head')[0].appendChild(node);
  }

  private redeclareKaltura() {/* eslint-disable */
    // To make sure, that we do not break anything if there will be some update(which is pretty unexpected).
    if (window['MWEMBED_VERSION'] === '2.101') {
      // Code is copied from original method. The only changed piece is arround "var newDoc = iframe?.contentWindow?.document;"
      window.kWidget.outputHTML5Iframe = function(targetId, settings) {
        var widgetElm = document.getElementById(targetId);
        var iframe = this.createIframe(targetId, widgetElm);
        var iframeProxy = this.createIframeProxy(widgetElm);
        iframeProxy.appendChild(iframe);
        widgetElm.parentNode.replaceChild(iframeProxy, widgetElm);
        var requestSettings = JSON.parse(JSON.stringify(settings));
        if (this.isInlineScriptRequest(requestSettings)) {
          requestSettings = this.getRuntimeSettings(requestSettings);
          this.widgetOriginalSettings[widgetElm.id] = settings;
          // @ts-ignore
          mw.setConfig('widgetOriginalSettings_' + widgetElm.id, settings);
        } else {
          settings.flashvars['inlineScript'] = false;
        }
        if (settings.captureClickEventForiOS && ((this.isSafari() && !this.isChrome()) || this.isAndroid())) {
          this.captureClickWrapedIframeUpdate(targetId, requestSettings, iframe);
        } else {
          var cbName = this.getIframeCbName(targetId);
          var iframeRequest = this.getIframeRequest(widgetElm, requestSettings);
          // @ts-ignore
          var ttlUnixVal = settings.flashvars['Kaltura.CacheTTL'] || mw.getConfig('Kaltura.CacheTTL');
          this.createContentInjectCallback = function(cbName, iframe, iframeRequest, settings,
                                                      ttlUnixVal) {
            var _this = this;

            window[cbName] = function(iframeData) {
              var newDoc = iframe?.contentWindow?.document;
              // HERE IS CHANGED LINE FROM ORIGINAL CODE. Sometimes we call this method after onDestroy and it causes errors.
              if (!newDoc) {
                return;
              }
              if (_this.isFirefox()) {
                newDoc.open('text/html', 'replace');
              } else {
                newDoc.open();
              }
              newDoc.write(iframeData.content);
              // @ts-ignore
              if (mw.getConfig('EmbedPlayer.DisableContextMenu')) {
                newDoc.getElementsByTagName('body')[0].setAttribute('oncontextmenu', 'return false;');
              }
              newDoc.close();
              // @ts-ignore
              if (_this.isInlineScriptRequest(settings) && kWidget.storage.isSupported()) {
                // @ts-ignore
                var iframeStoredData = kWidget.storage.getWithTTL(iframeRequest);
                if (iframeStoredData == null) {
                  _this.cachePlayer(iframeRequest, iframeData.content, ttlUnixVal);
                }
              }
              window[cbName] = null;
            };
          };
          this.createContentInjectCallback(cbName, iframe, iframeRequest, requestSettings, ttlUnixVal);
          if (this.iframeAutoEmbedCache[targetId]) {
            window[cbName](this.iframeAutoEmbedCache[targetId]);
          } else {
            var iframeData = null;
            // @ts-ignore
            if (kWidget.storage.isSupported()) {
              // @ts-ignore
              iframeData = kWidget.storage.getWithTTL(iframeRequest);
            }
            // @ts-ignore
            if (!mw.getConfig('debug') && iframeData && iframeData != 'null') {
              window[cbName]({ 'content': iframeData });
              cbName += 'updateAsync';
              this.createContentUpdateCallback(cbName, iframeRequest, requestSettings, ttlUnixVal);
            }
            // @ts-ignore
            if (kWidget.storage.isSupported() && this.isStorageMaxLimitExceeded(settings)) {
              // @ts-ignore
              kWidget.storage.clearNS();
            }
            window.kWidget.requestPlayer(iframeRequest, widgetElm, targetId, cbName, requestSettings);

          }
        }
      };
      // We just commented 3 lines of code. It fixes console warning
      window.kWidget.createIframe = function(targetId, widgetElm) {
        var iframeId = widgetElm.id + '_ifp';
        var iframeCssText = 'border:0px; max-width: 100%; max-height: 100%; width:100%;height:100%;';
        var iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.scrolling = 'no';
        iframe.name = iframeId;
        iframe.className = 'mwEmbedKalturaIframe';
        iframe.setAttribute('title', 'The Kaltura Dynamic Video Player');
        iframe.setAttribute('frameborder', '0');

        // iframe.setAttribute('allowfullscreen', true);
        // iframe.setAttribute('webkitallowfullscreen', true);
        // iframe.setAttribute('mozallowfullscreen', true);
        iframe.setAttribute('allow', 'autoplay *; fullscreen *; encrypted-media *');
        iframe.style.cssText = iframeCssText;
        try {
          var iframeHeight = widgetElm.style.height ? widgetElm.style.height : widgetElm.offsetHeight;
          if (this.isIOS() && (parseInt(iframeHeight) > 0)) {
            iframe.style.height = iframeHeight;
            var updateIframeID = setTimeout(function() {
              iframe.style.height = '100%';
            }, 6000);
            window.addEventListener('message', function(event) {
              if (event.data === 'layoutBuildDone') {
                iframe.style.height = '100%';
                clearTimeout(updateIframeID);
              }
            }, false);
          }
        } catch (e) {
          this.log('Error when trying to set iframe height: ' + e.message);
        }
        return iframe;
      };
    }
  }
}
