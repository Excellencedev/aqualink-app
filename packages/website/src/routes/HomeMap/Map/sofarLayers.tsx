import React from 'react';
import { LayersControl, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MapLayerName } from 'store/Homepage/types';

type SofarLayerDefinition = {
  name: MapLayerName;
  model: string;
  variableId: string;
  cmap: string;
};

type WMSLayerDefinition = {
  name: MapLayerName;
  layer: string;
  url: string;
};

const SOFAR_LAYERS: SofarLayerDefinition[] = [
  {
    name: 'Sea Surface Temperature',
    model: 'NOAACoralReefWatch',
    variableId: 'analysedSeaSurfaceTemperature',
    cmap: 'turbo',
  },
  {
    name: 'Heat Stress',
    model: 'NOAACoralReefWatch',
    variableId: 'degreeHeatingWeek',
    cmap: 'noaacoral',
  },
];

const WMS_LAYERS: WMSLayerDefinition[] = [
  {
    name: 'SST Anomaly',
    url: 'https://www.ncei.noaa.gov/thredds/wms/ncFC/fc-oisst-daily-avhrr-only-dly-prelim/OISST_Preliminary_Daily_AVHRR-only_Feature_Collection_best.ncd?COLORSCALERANGE=-5,5',
    layer: 'anom',
  },
];

const { REACT_APP_SOFAR_API_TOKEN: API_TOKEN } = process.env;

const sofarUrlFromDef = (
  { model, cmap, variableId }: SofarLayerDefinition,
  time?: string,
): string =>
  `https://api.sofarocean.com/marine-weather/v1/models/${model}/tile/{z}/{x}/{y}.png?colormap=${cmap}&token=${API_TOKEN}&variableID=${variableId}${
    time ? `&time=${encodeURIComponent(time)}` : ''
  }`;

interface SofarLayersProps {
  defaultLayerName?: MapLayerName;
  // ISO time parameter for time-enabled layers (SOFAR and WMS)
  time?: string;
}

export function SofarLayers({ defaultLayerName, time }: SofarLayersProps) {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer
        checked={!defaultLayerName}
        name="Satellite Imagery"
        key="no-overlay"
      >
        <TileLayer url="" />
      </LayersControl.BaseLayer>

      {SOFAR_LAYERS.map((def) => (
        <LayersControl.BaseLayer
          key={def.name}
          checked={def.name === defaultLayerName}
          name={def.name}
        >
          <TileLayer
            key={def.variableId}
            maxNativeZoom={9}
            url={sofarUrlFromDef(def, time)}
            opacity={0.5}
          />
        </LayersControl.BaseLayer>
      ))}

      {WMS_LAYERS.map((def) => (
        <LayersControl.BaseLayer
          key={def.name}
          checked={def.name === defaultLayerName}
          name={def.name}
        >
          <WMSTileLayer
            layers={def.layer}
            styles="boxfill/x-sst"
            transparent
            format="image/png"
            opacity={0.7}
            url={def.url}
            {...(time ? { params: { TIME: time } } : {})}
          />
        </LayersControl.BaseLayer>
      ))}
    </LayersControl>
  );
}

export default SofarLayers;