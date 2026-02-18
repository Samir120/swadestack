import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppSelector } from '../../store/hooks';
import { pcComponentApi } from '../../models/api/pcComponentApi';
import {
  PCComponent,
  ComponentType,
  CreatePCComponentDTO,
} from '../../models/types/pcComponent.types';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaToggleOn, FaToggleOff, FaSearch, FaFilter } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * PC Components Manager - Admin Component
 * Manages PC components with CRUD operations
 */

const COMPONENT_TYPES: ComponentType[] = [
  'cpu',
  'motherboard',
  'ram',
  'gpu',
  'ssd',
  'hdd',
  'psu',
  'case',
  'cooling',
  'optical',
  'fan',
  'os',
];

const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  cpu: 'CPU / Processor',
  motherboard: 'Motherboard',
  ram: 'RAM / Memory',
  gpu: 'Graphics Card',
  ssd: 'SSD Storage',
  hdd: 'HDD Storage',
  psu: 'Power Supply',
  case: 'Computer Case',
  cooling: 'CPU Cooling',
  optical: 'Optical Drive (DVD/Blu-Ray)',
  fan: 'Case Fan',
  os: 'Operating System',
};

const PCComponentsManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);
  const [components, setComponents] = useState<PCComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<PCComponent | null>(null);
  const [filterType, setFilterType] = useState<ComponentType | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreatePCComponentDTO>({
    componentType: 'cpu',
    name_en: '',
    name_sv: '',
    desc_en: '',
    desc_sv: '',
    manufacturer: '',
    modelNumber: '',
    price: 0,
    currency: 'SEK',
    imageUrl: '',
    specifications: {} as any,
    stock: 0,
    isActive: true,
    compatibilityNotes_en: '',
    compatibilityNotes_sv: '',
  });

  useEffect(() => {
    loadComponents();
  }, [filterType]);

  const loadComponents = async () => {
    setIsLoading(true);
    try {
      // Use admin endpoint to get all components including inactive ones
      const response = await pcComponentApi.getAllAdmin(1, 200, filterType || undefined);

      if (response.success && response.data) {
        setComponents(response.data.components);
      }
    } catch (error) {
      console.error('Failed to load components:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingComponent(null);
    setFormData({
      componentType: filterType || 'cpu',
      name_en: '',
      name_sv: '',
      desc_en: '',
      desc_sv: '',
      manufacturer: '',
      modelNumber: '',
      price: 0,
      currency: 'SEK',
      imageUrl: '',
      specifications: getDefaultSpecs(filterType || 'cpu'),
      stock: 0,
      isActive: true,
      compatibilityNotes_en: '',
      compatibilityNotes_sv: '',
    });
    setShowModal(true);
  };

  const handleEdit = (component: PCComponent) => {
    setEditingComponent(component);
    setFormData({
      componentType: component.componentType,
      name_en: component.name_en,
      name_sv: component.name_sv,
      desc_en: component.desc_en || '',
      desc_sv: component.desc_sv || '',
      manufacturer: component.manufacturer,
      modelNumber: component.modelNumber || '',
      price: component.price,
      currency: component.currency || 'SEK',
      imageUrl: component.imageUrl || '',
      specifications: component.specifications,
      stock: component.stock,
      isActive: component.isActive,
      compatibilityNotes_en: component.compatibilityNotes_en || '',
      compatibilityNotes_sv: component.compatibilityNotes_sv || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingComponent) {
        await pcComponentApi.update(editingComponent.id, { id: editingComponent.id, ...formData });
      } else {
        await pcComponentApi.create(formData);
      }
      setShowModal(false);
      loadComponents();
    } catch (error) {
      console.error('Failed to save component:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Component',
      message: 'Are you sure you want to delete this component? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await pcComponentApi.delete(id);
      loadComponents();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await pcComponentApi.toggleActive(id);
      loadComponents();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const getDefaultSpecs = (type: ComponentType): any => {
    switch (type) {
      case 'cpu':
        return { socket: '', tdp: 0, cores: 0, threads: 0, baseClock: 0, boostClock: 0 };
      case 'motherboard':
        return { socket: '', ramType: 'DDR5', ramSlots: 4, maxRamSpeed: 0, formFactor: 'ATX', pciSlots: 2, hasNVMe: true, nvmeSlots: 2, sataSlots: 4, chipset: '' };
      case 'ram':
        return { ramType: 'DDR5', speed: 0, capacity: 0, sticks: 2, latency: '' };
      case 'gpu':
        return { vram: 0, tdp: 0, length: 0, width: 0, pciSlots: 2, minPSU: 0, chipset: '' };
      case 'ssd':
        return { ssdType: 'NVMe', capacity: 0, readSpeed: 0, writeSpeed: 0, formFactor: 'M.2 2280', interface: 'PCIe 4.0 x4' };
      case 'hdd':
        return { capacity: 0, rpm: 7200, interface: 'SATA III', cacheSize: 256, formFactor: '3.5 inch' };
      case 'psu':
        return { wattage: 0, efficiency: '80+ Gold', modular: true, formFactor: 'ATX' };
      case 'case':
        return { formFactor: ['ATX'], maxGpuLength: 0, maxCpuCoolerHeight: 0, maxRadiatorSize: 0, psuFormFactor: 'ATX', driveBays: { '2.5inch': 0, '3.5inch': 0 }, fanSlots: 6, has525Bay: false };
      case 'cooling':
        return { coolingType: 'Air', socket: [], maxTdp: 0, height: 0, radiatorSize: 0, fanCount: 1 };
      case 'optical':
        return { driveType: 'DVD-RW', interface: 'SATA', readSpeed: '16x DVD', writeSpeed: '24x DVD', formFactor: '5.25 inch' };
      case 'fan':
        return { size: 120, rpm: { min: 0, max: 0 }, airflow: 0, noiseLevel: 0, connector: '4-pin PWM', rgb: false };
      case 'os':
        return { osType: 'Windows 11 Home', architecture: '64-bit', licenseType: 'OEM', language: 'Multi-language' };
      default:
        return {};
    }
  };

  const updateSpec = (key: string, value: any) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [key]: value,
      },
    });
  };

  // Filter components
  const filteredComponents = components.filter((c) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.name_en.toLowerCase().includes(query) ||
        c.name_sv.toLowerCase().includes(query) ||
        c.manufacturer.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Render specification fields based on component type
  const renderSpecFields = () => {
    const specs = formData.specifications as any;

    switch (formData.componentType) {
      case 'cpu':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Socket</label>
              <input
                type="text"
                value={specs.socket || ''}
                onChange={(e) => updateSpec('socket', e.target.value)}
                placeholder="e.g., AM5, LGA1700"
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">TDP (W)</label>
              <input
                type="number"
                value={specs.tdp || 0}
                onChange={(e) => updateSpec('tdp', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Cores</label>
              <input
                type="number"
                value={specs.cores || 0}
                onChange={(e) => updateSpec('cores', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Threads</label>
              <input
                type="number"
                value={specs.threads || 0}
                onChange={(e) => updateSpec('threads', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Base Clock (GHz)</label>
              <input
                type="number"
                step="0.1"
                value={specs.baseClock || 0}
                onChange={(e) => updateSpec('baseClock', parseFloat(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Boost Clock (GHz)</label>
              <input
                type="number"
                step="0.1"
                value={specs.boostClock || 0}
                onChange={(e) => updateSpec('boostClock', parseFloat(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case 'motherboard':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Socket</label>
              <input
                type="text"
                value={specs.socket || ''}
                onChange={(e) => updateSpec('socket', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Chipset</label>
              <input
                type="text"
                value={specs.chipset || ''}
                onChange={(e) => updateSpec('chipset', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">RAM Type</label>
              <select
                value={specs.ramType || 'DDR5'}
                onChange={(e) => updateSpec('ramType', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="DDR4">DDR4</option>
                <option value="DDR5">DDR5</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">RAM Slots</label>
              <input
                type="number"
                value={specs.ramSlots || 4}
                onChange={(e) => updateSpec('ramSlots', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Max RAM Speed (MHz)</label>
              <input
                type="number"
                value={specs.maxRamSpeed || 0}
                onChange={(e) => updateSpec('maxRamSpeed', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Form Factor</label>
              <select
                value={specs.formFactor || 'ATX'}
                onChange={(e) => updateSpec('formFactor', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="ATX">ATX</option>
                <option value="Micro-ATX">Micro-ATX</option>
                <option value="Mini-ITX">Mini-ITX</option>
                <option value="E-ATX">E-ATX</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">NVMe Slots</label>
              <input
                type="number"
                value={specs.nvmeSlots || 0}
                onChange={(e) => updateSpec('nvmeSlots', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">SATA Slots</label>
              <input
                type="number"
                value={specs.sataSlots || 0}
                onChange={(e) => updateSpec('sataSlots', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case 'ram':
        const totalCapacity = (specs.capacity || 0) * (specs.sticks || 1);
        return (
          <div className="space-y-4">
            {/* Kit Summary */}
            {totalCapacity > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Kit Summary:</span>{' '}
                  {specs.sticks || 1}x {specs.capacity || 0}GB = <strong>{totalCapacity}GB</strong> total
                  {specs.sticks > 1 && ` (uses ${specs.sticks} RAM slots)`}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300">RAM Type</label>
                <select
                  value={specs.ramType || 'DDR5'}
                  onChange={(e) => updateSpec('ramType', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                >
                  <option value="DDR4">DDR4</option>
                  <option value="DDR5">DDR5</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300">Speed (MHz)</label>
                <input
                  type="number"
                  value={specs.speed || 0}
                  onChange={(e) => updateSpec('speed', parseInt(e.target.value))}
                  className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300">Capacity per Stick (GB)</label>
                <input
                  type="number"
                  value={specs.capacity || 0}
                  onChange={(e) => updateSpec('capacity', parseInt(e.target.value))}
                  placeholder="e.g., 16 for 16GB sticks"
                  className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-neutral-400">Enter the capacity of each individual stick</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300">Number of Sticks in Kit</label>
                <select
                  value={specs.sticks || 2}
                  onChange={(e) => updateSpec('sticks', parseInt(e.target.value))}
                  className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                >
                  <option value={1}>1 stick (single)</option>
                  <option value={2}>2 sticks (dual channel)</option>
                  <option value={4}>4 sticks (quad channel)</option>
                </select>
                <p className="mt-1 text-xs text-neutral-400">How many RAM slots this kit will occupy</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300">Latency (CL)</label>
                <input
                  type="text"
                  value={specs.latency || ''}
                  onChange={(e) => updateSpec('latency', e.target.value)}
                  placeholder="e.g., CL30"
                  className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'gpu':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Chipset</label>
              <input
                type="text"
                value={specs.chipset || ''}
                onChange={(e) => updateSpec('chipset', e.target.value)}
                placeholder="e.g., RTX 4090"
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">VRAM (GB)</label>
              <input
                type="number"
                value={specs.vram || 0}
                onChange={(e) => updateSpec('vram', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">TDP (W)</label>
              <input
                type="number"
                value={specs.tdp || 0}
                onChange={(e) => updateSpec('tdp', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Length (mm)</label>
              <input
                type="number"
                value={specs.length || 0}
                onChange={(e) => updateSpec('length', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Min PSU (W)</label>
              <input
                type="number"
                value={specs.minPSU || 0}
                onChange={(e) => updateSpec('minPSU', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case 'ssd':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">SSD Type</label>
              <select
                value={specs.ssdType || 'NVMe'}
                onChange={(e) => updateSpec('ssdType', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="NVMe">NVMe (M.2)</option>
                <option value="SATA">SATA (2.5")</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Capacity (GB)</label>
              <input
                type="number"
                value={specs.capacity || 0}
                onChange={(e) => updateSpec('capacity', parseInt(e.target.value))}
                placeholder="e.g., 1000 for 1TB"
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Read Speed (MB/s)</label>
              <input
                type="number"
                value={specs.readSpeed || 0}
                onChange={(e) => updateSpec('readSpeed', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Write Speed (MB/s)</label>
              <input
                type="number"
                value={specs.writeSpeed || 0}
                onChange={(e) => updateSpec('writeSpeed', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Form Factor</label>
              <select
                value={specs.formFactor || 'M.2 2280'}
                onChange={(e) => updateSpec('formFactor', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="M.2 2280">M.2 2280</option>
                <option value="M.2 2230">M.2 2230</option>
                <option value="2.5 inch">2.5 inch</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Interface</label>
              <select
                value={specs.interface || 'PCIe 4.0 x4'}
                onChange={(e) => updateSpec('interface', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="PCIe 5.0 x4">PCIe 5.0 x4</option>
                <option value="PCIe 4.0 x4">PCIe 4.0 x4</option>
                <option value="PCIe 3.0 x4">PCIe 3.0 x4</option>
                <option value="SATA III">SATA III</option>
              </select>
            </div>
          </div>
        );

      case 'hdd':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Capacity (GB)</label>
              <input
                type="number"
                value={specs.capacity || 0}
                onChange={(e) => updateSpec('capacity', parseInt(e.target.value))}
                placeholder="e.g., 4000 for 4TB"
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">RPM</label>
              <select
                value={specs.rpm || 7200}
                onChange={(e) => updateSpec('rpm', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value={7200}>7200 RPM</option>
                <option value={5400}>5400 RPM</option>
                <option value={5900}>5900 RPM</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Cache Size (MB)</label>
              <input
                type="number"
                value={specs.cacheSize || 256}
                onChange={(e) => updateSpec('cacheSize', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Form Factor</label>
              <select
                value={specs.formFactor || '3.5 inch'}
                onChange={(e) => updateSpec('formFactor', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="3.5 inch">3.5 inch (Desktop)</option>
                <option value="2.5 inch">2.5 inch (Laptop)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Interface</label>
              <select
                value={specs.interface || 'SATA III'}
                onChange={(e) => updateSpec('interface', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="SATA III">SATA III</option>
                <option value="SATA II">SATA II</option>
              </select>
            </div>
          </div>
        );

      case 'psu':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Wattage (W)</label>
              <input
                type="number"
                value={specs.wattage || 0}
                onChange={(e) => updateSpec('wattage', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Efficiency</label>
              <select
                value={specs.efficiency || '80+ Gold'}
                onChange={(e) => updateSpec('efficiency', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="80+ White">80+ White</option>
                <option value="80+ Bronze">80+ Bronze</option>
                <option value="80+ Silver">80+ Silver</option>
                <option value="80+ Gold">80+ Gold</option>
                <option value="80+ Platinum">80+ Platinum</option>
                <option value="80+ Titanium">80+ Titanium</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Modular</label>
              <select
                value={specs.modular ? 'true' : 'false'}
                onChange={(e) => updateSpec('modular', e.target.value === 'true')}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="true">Yes (Modular)</option>
                <option value="false">No (Non-Modular)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Form Factor</label>
              <select
                value={specs.formFactor || 'ATX'}
                onChange={(e) => updateSpec('formFactor', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="ATX">ATX</option>
                <option value="SFX">SFX</option>
                <option value="SFX-L">SFX-L</option>
              </select>
            </div>
          </div>
        );

      case 'case':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Max GPU Length (mm)</label>
              <input
                type="number"
                value={specs.maxGpuLength || 0}
                onChange={(e) => updateSpec('maxGpuLength', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Max CPU Cooler Height (mm)</label>
              <input
                type="number"
                value={specs.maxCpuCoolerHeight || 0}
                onChange={(e) => updateSpec('maxCpuCoolerHeight', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Max Radiator Size (mm)</label>
              <input
                type="number"
                value={specs.maxRadiatorSize || 0}
                onChange={(e) => updateSpec('maxRadiatorSize', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Fan Slots</label>
              <input
                type="number"
                value={specs.fanSlots || 6}
                onChange={(e) => updateSpec('fanSlots', parseInt(e.target.value))}
                placeholder="Number of fan mounting positions"
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">PSU Form Factor</label>
              <select
                value={specs.psuFormFactor || 'ATX'}
                onChange={(e) => updateSpec('psuFormFactor', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="ATX">ATX</option>
                <option value="SFX">SFX</option>
                <option value="SFX-L">SFX-L</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Has 5.25" Bay</label>
              <select
                value={specs.has525Bay ? 'true' : 'false'}
                onChange={(e) => updateSpec('has525Bay', e.target.value === 'true')}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="true">Yes (for optical drives)</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        );

      case 'cooling':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Cooling Type</label>
              <select
                value={specs.coolingType || 'Air'}
                onChange={(e) => updateSpec('coolingType', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="Air">Air Cooler</option>
                <option value="AIO Liquid">AIO Liquid Cooler</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Max TDP (W)</label>
              <input
                type="number"
                value={specs.maxTdp || 0}
                onChange={(e) => updateSpec('maxTdp', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">
                {specs.coolingType === 'Air' ? 'Height (mm)' : 'Radiator Size (mm)'}
              </label>
              <input
                type="number"
                value={specs.coolingType === 'Air' ? (specs.height || 0) : (specs.radiatorSize || 0)}
                onChange={(e) =>
                  updateSpec(
                    specs.coolingType === 'Air' ? 'height' : 'radiatorSize',
                    parseInt(e.target.value)
                  )
                }
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Supported Sockets (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(specs.socket) ? specs.socket.join(', ') : ''}
                onChange={(e) =>
                  updateSpec(
                    'socket',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g., AM5, LGA1700, LGA1200"
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case 'optical':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Drive Type</label>
              <select
                value={specs.driveType || 'DVD-RW'}
                onChange={(e) => updateSpec('driveType', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="DVD-RW">DVD-RW</option>
                <option value="Blu-Ray Reader">Blu-Ray Reader</option>
                <option value="Blu-Ray Writer">Blu-Ray Writer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Interface</label>
              <select
                value={specs.interface || 'SATA'}
                onChange={(e) => updateSpec('interface', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="SATA">SATA (Internal)</option>
                <option value="USB 3.0">USB 3.0 (External)</option>
                <option value="USB 2.0">USB 2.0 (External)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Read Speed</label>
              <input
                type="text"
                value={specs.readSpeed || ''}
                onChange={(e) => updateSpec('readSpeed', e.target.value)}
                placeholder="e.g., 16x BD, 24x DVD"
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Write Speed</label>
              <input
                type="text"
                value={specs.writeSpeed || ''}
                onChange={(e) => updateSpec('writeSpeed', e.target.value)}
                placeholder="e.g., 16x BD-R, 24x DVD"
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Form Factor</label>
              <select
                value={specs.formFactor || '5.25 inch'}
                onChange={(e) => updateSpec('formFactor', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="5.25 inch">5.25 inch (Internal)</option>
                <option value="External">External (USB)</option>
              </select>
            </div>
          </div>
        );

      case 'fan':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Fan Size (mm)</label>
              <select
                value={specs.size || 120}
                onChange={(e) => updateSpec('size', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value={80}>80mm</option>
                <option value={92}>92mm</option>
                <option value={120}>120mm</option>
                <option value={140}>140mm</option>
                <option value={200}>200mm</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Min RPM</label>
              <input
                type="number"
                value={specs.rpm?.min || 0}
                onChange={(e) => updateSpec('rpm', { ...specs.rpm, min: parseInt(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Max RPM</label>
              <input
                type="number"
                value={specs.rpm?.max || 0}
                onChange={(e) => updateSpec('rpm', { ...specs.rpm, max: parseInt(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Airflow (CFM)</label>
              <input
                type="number"
                step="0.1"
                value={specs.airflow || 0}
                onChange={(e) => updateSpec('airflow', parseFloat(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Noise Level (dB)</label>
              <input
                type="number"
                step="0.1"
                value={specs.noiseLevel || 0}
                onChange={(e) => updateSpec('noiseLevel', parseFloat(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Connector Type</label>
              <select
                value={specs.connector || '4-pin PWM'}
                onChange={(e) => updateSpec('connector', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="4-pin PWM">4-pin PWM</option>
                <option value="3-pin DC">3-pin DC</option>
                <option value="ARGB">ARGB Header</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">RGB Lighting</label>
              <select
                value={specs.rgb ? 'true' : 'false'}
                onChange={(e) => updateSpec('rgb', e.target.value === 'true')}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        );

      case 'os':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">OS Type</label>
              <select
                value={specs.osType || 'Windows 11 Home'}
                onChange={(e) => updateSpec('osType', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="Windows 11 Home">Windows 11 Home</option>
                <option value="Windows 11 Pro">Windows 11 Pro</option>
                <option value="Windows 10 Home">Windows 10 Home</option>
                <option value="Windows 10 Pro">Windows 10 Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Architecture</label>
              <select
                value={specs.architecture || '64-bit'}
                onChange={(e) => updateSpec('architecture', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="64-bit">64-bit</option>
                <option value="32-bit">32-bit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">License Type</label>
              <select
                value={specs.licenseType || 'OEM'}
                onChange={(e) => updateSpec('licenseType', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="OEM">OEM (Single PC)</option>
                <option value="Retail">Retail (Transferable)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-300">Language</label>
              <input
                type="text"
                value={specs.language || 'Multi-language'}
                onChange={(e) => updateSpec('language', e.target.value)}
                placeholder="e.g., Multi-language"
                className="mt-1 w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">PC Components</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Manage PC components for the custom builder</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
        >
          <FaPlus size={12} /> Add Component
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-850 rounded-lg shadow-dark-md p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 sm:flex-none sm:w-64">
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              <FaFilter className="inline mr-1" size={10} /> Component Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ComponentType | '')}
              className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
            >
              <option value="">All Types</option>
              {COMPONENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {COMPONENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              <FaSearch className="inline mr-1" size={10} /> Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, manufacturer..."
              className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Components List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <LoadingSpinner />
          <div className="text-neutral-400 text-sm">Loading components...</div>
        </div>
      ) : (
        <div className="bg-surface-850 rounded-lg shadow-dark-md overflow-hidden">
          {filteredComponents.length === 0 ? (
            <div className="px-4 py-8 text-center text-neutral-400 text-sm">
              No components found. Add your first component to get started.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-surface-700">
                {filteredComponents.map((component) => (
                  <div key={component.id} className="p-3 hover:bg-surface-700 active:bg-surface-700">
                    <div className="flex items-start gap-3">
                      {/* Component Image/Icon */}
                      <div className="flex-shrink-0">
                        {component.imageUrl ? (
                          <img
                            src={component.imageUrl}
                            alt={component.name_en}
                            className="w-12 h-12 object-contain rounded-lg bg-surface-800"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-surface-800 rounded-lg flex items-center justify-center text-xl">
                            {component.componentType === 'cpu' && '🔲'}
                            {component.componentType === 'motherboard' && '🖥️'}
                            {component.componentType === 'ram' && '📊'}
                            {component.componentType === 'gpu' && '🎮'}
                            {component.componentType === 'ssd' && '💽'}
                            {component.componentType === 'hdd' && '💾'}
                            {component.componentType === 'psu' && '⚡'}
                            {component.componentType === 'case' && '📦'}
                            {component.componentType === 'cooling' && '❄️'}
                            {component.componentType === 'optical' && '📀'}
                            {component.componentType === 'fan' && '🌀'}
                            {component.componentType === 'os' && '🪟'}
                          </div>
                        )}
                      </div>

                      {/* Component Info */}
                      <div className="flex-1 min-w-0">
                        {/* Type Badge and Status Toggle */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 bg-surface-800 text-neutral-300 text-[10px] font-bold rounded uppercase">
                            {component.componentType}
                          </span>
                          <button
                            onClick={() => handleToggleActive(component.id)}
                            className="active:scale-95 transition"
                          >
                            {component.isActive ? (
                              <FaToggleOn size={18} className="text-green-500" />
                            ) : (
                              <FaToggleOff size={18} className="text-neutral-500" />
                            )}
                          </button>
                        </div>

                        {/* Name */}
                        <h3 className="text-sm font-bold text-white truncate">
                          {language === 'en' ? component.name_en : component.name_sv}
                        </h3>

                        {/* Manufacturer */}
                        <p className="text-[10px] text-neutral-400 truncate">{component.manufacturer}</p>

                        {/* Price and Stock */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-primary-400">{formatPrice(component.price)}</span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                            component.stock === 0
                              ? 'bg-red-900/30 text-red-400'
                              : component.stock <= 5
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-green-900/30 text-green-400'
                          }`}>
                            {component.stock} in stock
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleEdit(component)}
                          className="p-2 bg-primary-600/10 text-primary-400 rounded-lg hover:bg-primary-600/20 active:scale-95 transition"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(component.id)}
                          className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 active:scale-95 transition"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-surface-700">
                  <thead className="bg-surface-800">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Component
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="hidden md:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700">
                    {filteredComponents.map((component) => (
                      <tr key={component.id} className="hover:bg-surface-800">
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center gap-3">
                            {component.imageUrl ? (
                              <img
                                src={component.imageUrl}
                                alt={component.name_en}
                                className="w-10 h-10 object-contain rounded bg-surface-800"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-surface-800 rounded flex items-center justify-center text-xl">
                                {component.componentType === 'cpu' && '🔲'}
                                {component.componentType === 'motherboard' && '🖥️'}
                                {component.componentType === 'ram' && '📊'}
                                {component.componentType === 'gpu' && '🎮'}
                                {component.componentType === 'ssd' && '💽'}
                                {component.componentType === 'hdd' && '💾'}
                                {component.componentType === 'psu' && '⚡'}
                                {component.componentType === 'case' && '📦'}
                                {component.componentType === 'cooling' && '❄️'}
                                {component.componentType === 'optical' && '📀'}
                                {component.componentType === 'fan' && '🌀'}
                                {component.componentType === 'os' && '🪟'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-white text-sm">{component.name_en}</p>
                              <p className="text-xs text-neutral-400">{component.manufacturer}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className="px-2 py-1 text-xs font-bold bg-surface-800 text-neutral-300 rounded uppercase">
                            {component.componentType}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className="font-bold text-primary-400">{formatPrice(component.price)}</span>
                        </td>
                        <td className="hidden md:table-cell px-4 lg:px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            component.stock === 0
                              ? 'bg-red-900/30 text-red-400'
                              : component.stock <= 5
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-green-900/30 text-green-400'
                          }`}>
                            {component.stock} in stock
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(component.id)}
                            className="flex items-center gap-1.5 active:scale-95 transition"
                          >
                            {component.isActive ? (
                              <>
                                <FaToggleOn size={20} className="text-green-500" />
                                <span className="text-xs font-medium text-green-700">Active</span>
                              </>
                            ) : (
                              <>
                                <FaToggleOff size={20} className="text-neutral-500" />
                                <span className="text-xs font-medium text-neutral-400">Inactive</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(component)}
                              className="p-2 bg-primary-600/10 text-primary-400 rounded-lg hover:bg-primary-600/20 active:scale-95 transition"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(component.id)}
                              className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 active:scale-95 transition"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-surface-900 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-3xl lg:max-w-4xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-900 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <h3 className="text-xl sm:text-2xl font-thin text-white">
                {editingComponent ? 'Edit Component' : 'Add New Component'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-surface-700 rounded-lg active:scale-95 transition"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Component Type</label>
                  <select
                    value={formData.componentType}
                    onChange={(e) => {
                      const newType = e.target.value as ComponentType;
                      setFormData({
                        ...formData,
                        componentType: newType,
                        specifications: getDefaultSpecs(newType),
                      });
                    }}
                    disabled={!!editingComponent}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:bg-surface-700"
                  >
                    {COMPONENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {COMPONENT_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Name (English)</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Name (Swedish)</label>
                  <input
                    type="text"
                    value={formData.name_sv}
                    onChange={(e) => setFormData({ ...formData, name_sv: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Price (SEK)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    required
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    required
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-surface-600 rounded-lg active:scale-95 transition"
                  >
                    {formData.isActive ? (
                      <>
                        <FaToggleOn size={20} className="text-green-500" />
                        <span className="text-xs font-medium text-green-700">Active</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff size={20} className="text-neutral-500" />
                        <span className="text-xs font-medium text-neutral-400">Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-surface-800 rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-neutral-300 mb-3">
                  {COMPONENT_TYPE_LABELS[formData.componentType]} Specifications
                </h4>
                {renderSpecFields()}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-surface-800 border-t border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-surface-600 rounded-lg text-neutral-300 font-bold text-sm hover:bg-surface-700 active:scale-[0.98] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-500 active:scale-[0.98] transition"
              >
                {editingComponent ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCComponentsManager;
