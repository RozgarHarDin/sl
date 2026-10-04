import { useState, useEffect } from 'react';
import { ExamPreset, EXAM_PRESETS } from '../config/presets';

const CUSTOM_PRESETS_KEY = 'sarkaripixel_custom_presets';

export function usePresets() {
  const [presets, setPresets] = useState<ExamPreset[]>(() => {
    try {
      const custom = localStorage.getItem(CUSTOM_PRESETS_KEY);
      if (custom) {
        const parsed: ExamPreset[] = JSON.parse(custom);
        return [...EXAM_PRESETS, ...parsed];
      }
    } catch (e) {
      console.error(e);
    }
    return EXAM_PRESETS;
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>('ssc_cgl_photo');

  const selectedPreset = presets.find(p => p.id === selectedPresetId) || presets[0];

  const addCustomPreset = (newPreset: ExamPreset) => {
    setPresets(prev => {
      const updated = [...prev.filter(p => p.id !== newPreset.id), newPreset];
      const customOnly = updated.filter(p => !EXAM_PRESETS.some(ep => ep.id === p.id));
      localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(customOnly));
      return updated;
    });
    setSelectedPresetId(newPreset.id);
  };

  const updatePreset = (updatedPreset: ExamPreset) => {
    setPresets(prev => {
      const updated = prev.map(p => p.id === updatedPreset.id ? updatedPreset : p);
      return updated;
    });
  };

  const deleteCustomPreset = (presetId: string) => {
    setPresets(prev => {
      const updated = prev.filter(p => p.id !== presetId);
      const customOnly = updated.filter(p => !EXAM_PRESETS.some(ep => ep.id === p.id));
      localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(customOnly));
      return updated;
    });
    if (selectedPresetId === presetId) {
      setSelectedPresetId('ssc_cgl_photo');
    }
  };

  return {
    presets,
    selectedPreset,
    selectedPresetId,
    setSelectedPresetId,
    addCustomPreset,
    updatePreset,
    deleteCustomPreset,
  };
}
