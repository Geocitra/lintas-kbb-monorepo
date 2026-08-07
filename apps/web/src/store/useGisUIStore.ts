// apps/web/src/store/useGisUIStore.ts
import { create } from 'zustand';

// 1. Deklarasi Tipe Data agar TypeScript bisa membantu Auto-Complete
export type PanelType =
    | 'konfigurasi'
    | 'katalog-aset'
    | 'katalog-laporan'
    | 'tentang'
    | 'detil-aset'
    | 'detil-laporan';

export interface PanelData {
    id: string;
    type: PanelType;
    title: string;
    data?: any; // Fleksibel untuk menampung JSON aset atau laporan
}

export interface MapBounds {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
}

interface GisUIState {
    // --- UI STATE ---
    activePanels: PanelData[];
    activeBaseMap: string;
    mapOpacity: number;
    activeLayers: string[];

    // --- INTERACTIVITY STATE ---
    selectedAssetId: string | null;
    selectedReportId: string | null;

    // --- SPATIAL STATE ---
    mapCenter: [number, number];
    mapZoom: number;
    mapBounds: MapBounds | null;

    // --- ACTIONS ---
    openPanel: (type: PanelType, title: string, data?: any) => void;
    closePanel: (id: string) => void;
    closePanelsToTheRight: (index: number) => void;
    clearPanels: () => void;

    setActiveBaseMap: (baseMapId: string) => void;
    setMapOpacity: (opacity: number) => void;
    toggleLayer: (layerId: string) => void;

    setSelectedAssetId: (id: string | null) => void;
    setSelectedReportId: (id: string | null) => void;

    setMapCenter: (center: [number, number]) => void;
    setMapZoom: (zoom: number) => void;
    setMapBounds: (bounds: MapBounds | null) => void;
    resetGisUI: () => void;
}

// 2. Pusat Pemerintahan Kordinat Kabupaten Bandung Barat (KBB)
const DEFAULT_CENTER: [number, number] = [-6.8431, 107.4912];
const DEFAULT_ZOOM = 11;

export const useGisUIStore = create<GisUIState>((set) => ({
    activePanels: [],
    activeBaseMap: 'dark',
    mapOpacity: 80,
    activeLayers: ['assets', 'reports', 'boundaries'],

    selectedAssetId: null,
    selectedReportId: null,

    mapCenter: DEFAULT_CENTER,
    mapZoom: DEFAULT_ZOOM,
    mapBounds: null,

    // ==========================================
    // PANEL ORCHESTRATION LOGIC
    // ==========================================
    openPanel: (type, title, data = null) => set((state) => {
        const isDetailPanel = type === 'detil-aset' || type === 'detil-laporan';
        let nextPanels = [...state.activePanels];

        if (isDetailPanel) {
            // Jika membuka panel detail, tutup panel detail lainnya agar tidak bertumpuk
            nextPanels = nextPanels.filter(p => p.type !== 'detil-aset' && p.type !== 'detil-laporan');
        } else {
            // Jika membuka panel menu utama, tutup menu utama lainnya
            const menuTypes = ['katalog-aset', 'katalog-laporan', 'konfigurasi', 'tentang'];
            if (menuTypes.includes(type)) {
                nextPanels = nextPanels.filter(p => !menuTypes.includes(p.type));
            }
            nextPanels = nextPanels.filter(p => p.type !== type);
        }

        const newPanel: PanelData = {
            id: `${type}-${Date.now()}`,
            type,
            title,
            data
        };

        nextPanels.push(newPanel);
        return { activePanels: nextPanels };
    }),

    closePanel: (id) => set((state) => {
        const panelToClose = state.activePanels.find(p => p.id === id);
        if (!panelToClose) return state;

        const filtered = state.activePanels.filter(p => p.id !== id);
        const isDetailClosed = panelToClose.type === 'detil-aset' || panelToClose.type === 'detil-laporan';

        return {
            activePanels: filtered,
            // Hapus state selected jika panel detail ditutup
            ...(isDetailClosed && { selectedAssetId: null, selectedReportId: null })
        };
    }),

    closePanelsToTheRight: (index) => set((state) => {
        const sliced = state.activePanels.slice(0, index + 1);
        const hasDetails = sliced.some(p => p.type === 'detil-aset' || p.type === 'detil-laporan');

        return {
            activePanels: sliced,
            ...(!hasDetails && { selectedAssetId: null, selectedReportId: null })
        };
    }),

    clearPanels: () => set({ activePanels: [], selectedAssetId: null, selectedReportId: null }),

    // ==========================================
    // MAP CONTROLS
    // ==========================================
    setActiveBaseMap: (baseMapId) => set({ activeBaseMap: baseMapId }),
    setMapOpacity: (opacity) => set({ mapOpacity: opacity }),

    toggleLayer: (layerId) => set((state) => ({
        activeLayers: state.activeLayers.includes(layerId)
            ? state.activeLayers.filter(id => id !== layerId)
            : [...state.activeLayers, layerId]
    })),

    setSelectedAssetId: (id) => set({ selectedAssetId: id }),
    setSelectedReportId: (id) => set({ selectedReportId: id }),

    setMapCenter: (center) => set({ mapCenter: center }),
    setMapZoom: (zoom) => set({ mapZoom: zoom }),
    setMapBounds: (bounds) => set({ mapBounds: bounds }),

    resetGisUI: () => set({
        activePanels: [],
        activeBaseMap: 'dark',
        mapOpacity: 80,
        activeLayers: ['assets', 'reports', 'boundaries'],
        selectedAssetId: null,
        selectedReportId: null,
        mapCenter: DEFAULT_CENTER,
        mapZoom: DEFAULT_ZOOM,
        mapBounds: null
    })
}));