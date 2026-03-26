'use client';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { useTowers } from '@/lib/api/queries';
import { useTowerStore } from '@/lib/store/UseTowerStore';



export default function Header({ onMenuClick }) {

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000); // update every minute

    return () => clearInterval(interval);
  }, []);

const { selectedTower, setSelectedTower } = useTowerStore();
const { data: towers, isLoading } = useTowers();

const handleTowerChange = (value) => {
  setSelectedTower(value);
};

useEffect(() => {
  if (towers && towers.length > 0 && !selectedTower) {
    setSelectedTower(towers[0].id);
  }
}, [towers, selectedTower]);


  const hours = time.getHours();

  let greeting = "Good Morning ☀️";
  if (hours >= 12 && hours < 17) greeting = "Good Afternoon 🌤️";
  else if (hours >= 17 && hours < 21) greeting = "Good Evening 🌆";
  else if (hours >= 21 || hours < 5) greeting = "Good Night 🌙";

  // const [selectedTower, setSelectedTower] = useState('');
  // const { data: towers } = useTowers();

  // useEffect(() => {
  //   const storedTower = localStorage.getItem('selectedTower');
  //   if (storedTower) {
  //     setSelectedTower(storedTower);
  //   } else if (towers && towers.length > 0) {
  //     setSelectedTower(towers[0].id);
  //     localStorage.setItem('selectedTower', towers[0].id);
  //   }
  // }, [towers]);

  // const handleTowerChange = (value) => {
  //   setSelectedTower(value);
  //   localStorage.setItem('selectedTower', value);
  //   window.location.reload(); // Reload to fetch tower-specific data
  // };

  return (
    <header className="sticky top-0 z-30 bg-background border-b" style={{ borderColor: COLORS.border }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" style={{ color: COLORS.primary }} />
            <span className="font-semibold">Select Tower:</span>
          </div>
          
          <Select value={selectedTower} onValueChange={handleTowerChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select tower" />
            </SelectTrigger>
            <SelectContent>
              {towers?.map((tower) => (
                <SelectItem key={tower.id} value={tower.id}>
                  {tower.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

       <div className="flex items-center gap-4">
      <div className="flex flex-col leading-tight">
        
        {/* Greeting */}
        <span className="text-sm font-medium text-foreground">
          {greeting}
        </span>

        {/* Date */}
        <span className="text-xs text-muted-foreground">
          {time.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>

    </div>
      </div>
    </header>
  );
}
