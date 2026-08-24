export type SensorType =
  | 'SEISMIC'
  | 'HYDROLOGICAL'
  | 'METEOROLOGICAL'
  | 'GEOTECHNICAL'
  | 'THERMAL_INFRARED'
  | 'OCEAN_DART';

export type SensorStatus = 'NORMAL' | 'ELEVATED' | 'WARNING' | 'CRITICAL';

export interface MetricData {
  label: string;
  value: number;
  unit: string;
  baseline: number;
  thresholdWarn: number;
  thresholdCrit: number;
}

export interface HistoricalPoint {
  time: string;
  value: number;
}

export interface SensorStation {
  id: string;
  name: string;
  code: string;
  type: SensorType;
  location: {
    lat: number;
    lng: number;
    sector: string;
    elevationMeters: number;
  };
  status: SensorStatus;
  primaryMetricKey: string;
  metrics: Record<string, MetricData>;
  history: HistoricalPoint[];
  batteryPercent: number;
  signalLatencyMs: number;
  lastPing: string;
}

export type HazardType =
  | 'EARTHQUAKE'
  | 'TSUNAMI'
  | 'FLASH_FLOOD'
  | 'WILDFIRE'
  | 'CYCLONE'
  | 'LANDSLIDE';

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOMINAL';

export interface DisasterEvent {
  id: string;
  title: string;
  type: HazardType;
  threatLevel: ThreatLevel;
  epicenter: {
    lat: number;
    lng: number;
    name: string;
    depthKm?: number;
  };
  magnitude?: number;
  leadTimeSeconds: number;
  initialLeadTimeSeconds: number;
  radiusKm: number;
  timestamp: string;
  status: 'DETECTED' | 'EVALUATING' | 'WARNING_ACTIVE' | 'CASCADE_MONITORING' | 'CONTAINED';
  affectedPopulation: number;
}

export interface CascadingHazard {
  hazard: string;
  delayMinutes: number;
  probability: number;
  severity: string;
}

export interface InfrastructureDirective {
  system: string;
  action: string;
  priority: string;
  executed?: boolean;
}

export interface PredictionAnalysis {
  threatLevel: string;
  primaryHazard: string;
  leadTimeSeconds: number;
  aiConfidence: number;
  impactProbability: number;
  affectedRadiusKm: number;
  summary: string;
  cascadingHazards: CascadingHazard[];
  infrastructureDirectives: InfrastructureDirective[];
  evacuationRecommendations: string[];
}

export interface BroadcastPackage {
  easTitle: string;
  weaShortSms: string;
  weaDetailedSms: string;
  radioBroadcastScript: string;
  sirenCadence: string;
  multilingualAlerts: {
    Spanish: string;
    French: string;
    Japanese: string;
  };
}

export interface EvacuationShelter {
  id: string;
  name: string;
  sector: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
  status: 'OPEN' | 'NEAR_CAPACITY' | 'FULL';
  altitudeMeters: number;
  amenities: string[];
}

export interface EvacuationRoute {
  id: string;
  name: string;
  riskLevel: 'SAFE' | 'CAUTION' | 'HAZARDOUS';
  transitTimeMin: number;
  originSector: string;
  destinationShelter: string;
  capacityRate: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  category: HazardType;
  threatLevel: ThreatLevel;
  leadTimeSeconds: number;
  description: string;
  epicenter: {
    lat: number;
    lng: number;
    name: string;
    depthKm?: number;
  };
  magnitude?: number;
  affectedPopulation: number;
  sensorModifiers: {
    stationId: string;
    primaryValue: number;
    status: SensorStatus;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}
