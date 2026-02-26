'use client';
import { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { useTowers, useFlats } from '@/lib/api/queries';

/**
 * Cascading Tower -> Flat selector
 * When user selects a tower, only flats from that tower are shown
 */
export default function TowerFlatSelector({ 
  selectedTower, 
  selectedFlat, 
  onTowerChange, 
  onFlatChange,
  towerLabel = 'Tower *',
  flatLabel = 'Flat Number *',
  towerError,
  flatError,
  required = true,
  showFlatDetails = false,
}) {
  const { data: towers } = useTowers();
  const { data: allFlats } = useFlats();

  // Filter flats based on selected tower
  const filteredFlats = useMemo(() => {
    if (!selectedTower || !allFlats) return [];
    return allFlats.filter(f => f.towerId === selectedTower || f.tower === selectedTower);
  }, [selectedTower, allFlats]);

  // Reset flat when tower changes
  const handleTowerChange = (towerId) => {
    onTowerChange(towerId);
    onFlatChange(''); // Reset flat selection
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{towerLabel}</Label>
        <select
          className={`w-full p-2 border rounded-md text-sm ${towerError ? 'border-red-500' : ''}`}
          value={selectedTower}
          onChange={(e) => handleTowerChange(e.target.value)}
          required={required}
        >
          <option value="">Select Tower</option>
          {towers?.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.floors} floors)</option>
          ))}
        </select>
        {towerError && <p className="text-xs text-red-500">{towerError}</p>}
      </div>
      <div className="space-y-2">
        <Label>{flatLabel}</Label>
        <select
          className={`w-full p-2 border rounded-md text-sm ${flatError ? 'border-red-500' : ''} ${!selectedTower ? 'opacity-50' : ''}`}
          value={selectedFlat}
          onChange={(e) => onFlatChange(e.target.value)}
          required={required}
          disabled={!selectedTower}
        >
          <option value="">{selectedTower ? 'Select Flat' : 'Select tower first'}</option>
          {filteredFlats?.map(f => (
            <option key={f.id} value={f.flatNumber}>
              {f.flatNumber} - Floor {f.floor} - {f.bhk} BHK {f.occupancyStatus === 'occupied' ? '(Occupied)' : '(Vacant)'}
            </option>
          ))}
          {selectedTower && filteredFlats.length === 0 && (
            <option value="" disabled>No flats in this tower</option>
          )}
        </select>
        {flatError && <p className="text-xs text-red-500">{flatError}</p>}
      </div>
    </div>
  );
}
