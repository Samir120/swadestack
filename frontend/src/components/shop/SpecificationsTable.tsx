import type { PCComponent, ComponentType } from '../../models/types/pcComponent.types';

interface SpecificationsTableProps {
  component: PCComponent;
  language: 'en' | 'sv';
}

interface BilingualLabel {
  en: string;
  sv: string;
}

interface SpecFieldConfig {
  key: string;
  label: BilingualLabel;
  unit?: string;
}

const SPEC_FIELDS: Record<ComponentType, SpecFieldConfig[]> = {
  cpu: [
    { key: 'socket', label: { en: 'Socket', sv: 'Sockel' } },
    { key: 'cores', label: { en: 'Cores', sv: 'K\u00e4rnor' } },
    { key: 'threads', label: { en: 'Threads', sv: 'Tr\u00e5dar' } },
    { key: 'baseClock', label: { en: 'Base Clock', sv: 'Basfrekvens' }, unit: 'GHz' },
    { key: 'boostClock', label: { en: 'Boost Clock', sv: 'Boostfrekvens' }, unit: 'GHz' },
    { key: 'tdp', label: { en: 'TDP', sv: 'TDP' }, unit: 'W' },
    { key: 'integratedGraphics', label: { en: 'Integrated Graphics', sv: 'Integrerad grafik' } },
  ],
  motherboard: [
    { key: 'socket', label: { en: 'Socket', sv: 'Sockel' } },
    { key: 'chipset', label: { en: 'Chipset', sv: 'Chipset' } },
    { key: 'formFactor', label: { en: 'Form Factor', sv: 'Formfaktor' } },
    { key: 'ramType', label: { en: 'RAM Type', sv: 'RAM-typ' } },
    { key: 'ramSlots', label: { en: 'RAM Slots', sv: 'RAM-platser' } },
    { key: 'maxRamSpeed', label: { en: 'Max RAM Speed', sv: 'Max RAM-hastighet' }, unit: 'MHz' },
    { key: 'pciSlots', label: { en: 'PCIe Slots', sv: 'PCIe-platser' } },
    { key: 'nvmeSlots', label: { en: 'NVMe Slots', sv: 'NVMe-platser' } },
    { key: 'sataSlots', label: { en: 'SATA Ports', sv: 'SATA-portar' } },
    { key: 'hasNVMe', label: { en: 'NVMe Support', sv: 'NVMe-st\u00f6d' } },
  ],
  ram: [
    { key: 'ramType', label: { en: 'RAM Type', sv: 'RAM-typ' } },
    { key: 'speed', label: { en: 'Speed', sv: 'Hastighet' }, unit: 'MHz' },
    { key: 'capacity', label: { en: 'Capacity', sv: 'Kapacitet' }, unit: 'GB' },
    { key: 'sticks', label: { en: 'Sticks', sv: 'Moduler' } },
    { key: 'latency', label: { en: 'Latency', sv: 'Latens' } },
  ],
  gpu: [
    { key: 'chipset', label: { en: 'Chipset', sv: 'Chipset' } },
    { key: 'vram', label: { en: 'VRAM', sv: 'VRAM' }, unit: 'GB' },
    { key: 'tdp', label: { en: 'TDP', sv: 'TDP' }, unit: 'W' },
    { key: 'length', label: { en: 'Length', sv: 'L\u00e4ngd' }, unit: 'mm' },
    { key: 'minPSU', label: { en: 'Min PSU', sv: 'Min n\u00e4taggregat' }, unit: 'W' },
  ],
  ssd: [
    { key: 'ssdType', label: { en: 'Type', sv: 'Typ' } },
    { key: 'capacity', label: { en: 'Capacity', sv: 'Kapacitet' }, unit: 'GB' },
    { key: 'readSpeed', label: { en: 'Read Speed', sv: 'L\u00e4shastighet' }, unit: 'MB/s' },
    { key: 'writeSpeed', label: { en: 'Write Speed', sv: 'Skrivhastighet' }, unit: 'MB/s' },
    { key: 'formFactor', label: { en: 'Form Factor', sv: 'Formfaktor' } },
    { key: 'interface', label: { en: 'Interface', sv: 'Gr\u00e4nssnitt' } },
  ],
  hdd: [
    { key: 'capacity', label: { en: 'Capacity', sv: 'Kapacitet' }, unit: 'GB' },
    { key: 'rpm', label: { en: 'RPM', sv: 'Varvtal' } },
    { key: 'interface', label: { en: 'Interface', sv: 'Gr\u00e4nssnitt' } },
    { key: 'cacheSize', label: { en: 'Cache Size', sv: 'Cachestorlek' }, unit: 'MB' },
    { key: 'formFactor', label: { en: 'Form Factor', sv: 'Formfaktor' } },
  ],
  psu: [
    { key: 'wattage', label: { en: 'Wattage', sv: 'Effekt' }, unit: 'W' },
    { key: 'efficiency', label: { en: 'Efficiency', sv: 'Effektivitet' } },
    { key: 'modular', label: { en: 'Modular', sv: 'Modul\u00e4r' } },
    { key: 'formFactor', label: { en: 'Form Factor', sv: 'Formfaktor' } },
  ],
  case: [
    { key: 'formFactor', label: { en: 'Form Factor', sv: 'Formfaktor' } },
    { key: 'maxGpuLength', label: { en: 'Max GPU Length', sv: 'Max GPU-l\u00e4ngd' }, unit: 'mm' },
    { key: 'maxCpuCoolerHeight', label: { en: 'Max CPU Cooler Height', sv: 'Max CPU-kylare h\u00f6jd' }, unit: 'mm' },
    { key: 'maxRadiatorSize', label: { en: 'Max Radiator Size', sv: 'Max radiatorstorlek' }, unit: 'mm' },
    { key: 'driveBays', label: { en: 'Drive Bays', sv: 'Diskplatser' } },
    { key: 'fanSlots', label: { en: 'Fan Slots', sv: 'Fl\u00e4ktplatser' } },
  ],
  cooling: [
    { key: 'coolingType', label: { en: 'Cooling Type', sv: 'Kylningstyp' } },
    { key: 'socket', label: { en: 'Socket', sv: 'Sockel' } },
    { key: 'maxTdp', label: { en: 'Max TDP', sv: 'Max TDP' }, unit: 'W' },
    { key: 'height', label: { en: 'Height', sv: 'H\u00f6jd' }, unit: 'mm' },
    { key: 'radiatorSize', label: { en: 'Radiator Size', sv: 'Radiatorstorlek' }, unit: 'mm' },
    { key: 'fanCount', label: { en: 'Fan Count', sv: 'Antal fl\u00e4ktar' } },
  ],
  optical: [
    { key: 'driveType', label: { en: 'Drive Type', sv: 'Enhetstyp' } },
    { key: 'interface', label: { en: 'Interface', sv: 'Gr\u00e4nssnitt' } },
    { key: 'readSpeed', label: { en: 'Read Speed', sv: 'L\u00e4shastighet' } },
    { key: 'writeSpeed', label: { en: 'Write Speed', sv: 'Skrivhastighet' } },
    { key: 'formFactor', label: { en: 'Form Factor', sv: 'Formfaktor' } },
  ],
  fan: [
    { key: 'size', label: { en: 'Size', sv: 'Storlek' }, unit: 'mm' },
    { key: 'rpm', label: { en: 'RPM', sv: 'Varvtal' } },
    { key: 'airflow', label: { en: 'Airflow', sv: 'Luftfl\u00f6de' }, unit: 'CFM' },
    { key: 'noiseLevel', label: { en: 'Noise Level', sv: 'Ljudniv\u00e5' }, unit: 'dBA' },
    { key: 'connector', label: { en: 'Connector', sv: 'Anslutning' } },
    { key: 'rgb', label: { en: 'RGB', sv: 'RGB' } },
  ],
  os: [
    { key: 'osType', label: { en: 'OS Type', sv: 'Operativsystem' } },
    { key: 'architecture', label: { en: 'Architecture', sv: 'Arkitektur' } },
    { key: 'licenseType', label: { en: 'License Type', sv: 'Licenstyp' } },
    { key: 'language', label: { en: 'Language', sv: 'Spr\u00e5k' } },
  ],
};

const formatValue = (
  value: unknown,
  unit: string | undefined,
  language: 'en' | 'sv',
  key: string
): string | null => {
  if (value === undefined || value === null) return null;

  // Boolean values
  if (typeof value === 'boolean') {
    return value
      ? language === 'en' ? 'Yes' : 'Ja'
      : language === 'en' ? 'No' : 'Nej';
  }

  // Array values (e.g., case formFactor, cooling socket)
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // RPM object with min/max (fan rpm)
  if (
    key === 'rpm' &&
    typeof value === 'object' &&
    value !== null &&
    'min' in value &&
    'max' in value
  ) {
    const rpm = value as { min: number; max: number };
    return `${rpm.min} - ${rpm.max} RPM`;
  }

  // Drive bays object
  if (key === 'driveBays' && typeof value === 'object' && value !== null) {
    const bays = value as Record<string, number>;
    const parts: string[] = [];
    if (bays['2.5inch'] && bays['2.5inch'] > 0) {
      parts.push(`${bays['2.5inch']}x 2.5"`);
    }
    if (bays['3.5inch'] && bays['3.5inch'] > 0) {
      parts.push(`${bays['3.5inch']}x 3.5"`);
    }
    return parts.length > 0 ? parts.join(', ') : null;
  }

  // Other objects - attempt to format
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  // Numeric or string values with optional unit
  const displayValue = String(value);
  if (unit) {
    return `${displayValue} ${unit}`;
  }
  return displayValue;
};

const SpecificationsTable = ({ component, language }: SpecificationsTableProps) => {
  const fields = SPEC_FIELDS[component.componentType];
  if (!fields) return null;

  const specs = component.specifications as unknown as Record<string, unknown>;

  const rows = fields
    .map((field) => {
      const formatted = formatValue(specs[field.key], field.unit, language, field.key);
      if (formatted === null) return null;
      return {
        label: field.label[language],
        value: formatted,
      };
    })
    .filter((row): row is { label: string; value: string } => row !== null);

  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-surface-700">
      {rows.map((row, index) => (
        <div
          key={index}
          className={`flex justify-between px-4 py-3 ${
            index % 2 === 1 ? 'bg-gray-50 dark:bg-surface-800/50' : ''
          }`}
        >
          <span className="text-sm font-medium text-gray-600 dark:text-neutral-400">
            {row.label}
          </span>
          <span className="text-sm text-gray-900 dark:text-white font-medium">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SpecificationsTable;
