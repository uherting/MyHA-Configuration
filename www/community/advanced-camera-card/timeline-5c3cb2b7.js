import{_ as e,n as t,t as i,a,x as r,r as o,dc as n}from"./card-34d93bb2.js";import"./timeline-core-854381a3.js";import"./startOfHour-e3b1f90c.js";import"./endOfDay-d46fa772.js";import"./date-picker-3bc5b7c3.js";let s=class extends a{render(){return this.timelineConfig?r`
      <advanced-camera-card-timeline-core
        .hass=${this.hass}
        .viewManagerEpoch=${this.viewManagerEpoch}
        .timelineConfig=${this.timelineConfig}
        .thumbnailConfig=${this.timelineConfig.controls.thumbnails}
        .cameraManager=${this.cameraManager}
        .viewItemManager=${this.viewItemManager}
        .cameraIDs=${this.cameraManager?.getStore().getCameraIDsWithCapability({anyCapabilities:["clips","snapshots","recordings"]})}
        .cardWideConfig=${this.cardWideConfig}
        .itemClickAction=${"none"===this.timelineConfig.controls.thumbnails.mode?"play":"select"}
      >
      </advanced-camera-card-timeline-core>
    `:r``}static get styles(){return o(n)}};e([t({attribute:!1})],s.prototype,"hass",void 0),e([t({attribute:!1})],s.prototype,"viewManagerEpoch",void 0),e([t({attribute:!1})],s.prototype,"timelineConfig",void 0),e([t({attribute:!1})],s.prototype,"cameraManager",void 0),e([t({attribute:!1})],s.prototype,"viewItemManager",void 0),e([t({attribute:!1})],s.prototype,"cardWideConfig",void 0),s=e([i("advanced-camera-card-timeline")],s);export{s as AdvancedCameraCardTimeline};
