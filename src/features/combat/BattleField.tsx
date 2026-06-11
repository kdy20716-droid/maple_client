import React, { useEffect, useRef, useState } from 'react';
import { useEdgePan } from '../../hooks/useEdgePan';
import { useUnitStore } from '../../store/unitStore';
import { useEnemyStore } from '../../store/enemyStore';
import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import type { UnitRarity, Position, Enemy } from '../../types/game';
import { generateId, RARITY_COLORS } from '../../utils/gachaUtils';
import ChatOverlay from '../../components/chat/ChatOverlay';
import MapControls from './MapControls';

const MAP_CENTERS = [
  { x: 1000, y: 1000 },
  { x: 3000, y: 1000 },
  { x: 1000, y: 3000 },
  { x: 3000, y: 3000 },
];

const STAIR_CLIP_PATH = `polygon(
  180px 0%, calc(100% - 180px) 0%, 
  calc(100% - 180px) 60px, calc(100% - 120px) 60px, 
  calc(100% - 120px) 120px, calc(100% - 60px) 120px, 
  calc(100% - 60px) 180px, 100% 180px,
  100% calc(100% - 180px), calc(100% - 60px) calc(100% - 180px),
  calc(100% - 60px) calc(100% - 120px), calc(100% - 120px) calc(100% - 120px),
  calc(100% - 120px) calc(100% - 60px), calc(100% - 180px) calc(100% - 60px),
  calc(100% - 180px) 100%, 180px 100%,
  180px calc(100% - 60px), 120px calc(100% - 60px),
  120px calc(100% - 120px), 60px calc(100% - 120px),
  60px calc(100% - 180px), 0% calc(100% - 180px),
  0% 180px, 60px 180px,
  60px 120px, 120px 120px,
  120px 60px, 180px 60px
)`;

// P1 웨이포인트 (반지름을 줄이고 반시계 방향으로 회전)
const P1_WAYPOINTS: Position[] = (() => {
  const points: Position[] = [];
  const segments = 64; 
  const radius = 420;   // 반지름을 420으로 축소
  const centerX = 1000;
  const centerY = 1000;
  
  for (let i = 0; i < segments; i++) {
    // - (i / segments) 를 사용하여 반시계 방향으로 변경
    const angle = -(i / segments) * Math.PI * 2 - Math.PI / 2; 
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    });
  }
  return points;
})();

interface Projectile {
  id: string;
  type: 'aura' | 'sphere' | 'arrow';
  from: Position;
  to: Position;
  duration: number;
  startTime: number;
}

const BattleField: React.FC = () => {
  const containerRef = useEdgePan({ speed: 25, margin: 150 });
  const { units, updateUnitPosition } = useUnitStore();
  const { enemies, updateEnemyPositions, spawnEnemy, damageEnemy } = useEnemyStore();
  const { 
    selectedUnitIds, 
    selectedEnemyId, 
    setSelectedUnitIds, 
    setSelectedEnemyId, 
    handleMapClick, 
    scrollPos
  } = useUIStore();
  const { wave, monsterCount, isGameOver, resetGame } = useGameStore();
  
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const lastSpawnTime = useRef(performance.now());
  const hasStartedSpawning = useRef(false);
  const lastAttackTimes = useRef<Record<string, number>>({});
  const requestRef = useRef<number>();

  const getMouseWorldPos = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: e.clientX - rect.left + scrollPos.x,
      y: e.clientY - rect.top + scrollPos.y
    };
  };

  const animate = (time: number) => {
    if (isGameOver) return;

    const deltaTime = 0.016; 
    updateEnemyPositions(deltaTime * 100, P1_WAYPOINTS);

    if (!hasStartedSpawning.current) {
      if (time > 10000) {
        hasStartedSpawning.current = true;
        lastSpawnTime.current = time;
      }
    } else {
      if (time - lastSpawnTime.current > 1500) {
        spawnEnemy({
          id: generateId(),
          name: `Wave ${wave} Slime`,
          hp: 30 + wave * 20,
          maxHp: 30 + wave * 20,
          shield: wave > 10 ? (wave - 10) * 10 : 0,
          maxShield: wave > 10 ? (wave - 10) * 10 : 0,
          speed: 1,
          position: { ...P1_WAYPOINTS[0] },
          reward: 5,
          waypointIndex: 1,
        });
        lastSpawnTime.current = time;
      }
    }

    units.forEach(unit => {
      const lastAttack = lastAttackTimes.current[unit.id] || 0;
      if (time - lastAttack > unit.attackSpeed * 1000) {
        let closestEnemy: Enemy | null = null;
        let minDistance = unit.range;

        enemies.forEach(enemy => {
          const dx = enemy.position.x - unit.position.x;
          const dy = enemy.position.y - unit.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            minDistance = dist;
            closestEnemy = enemy;
          }
        });

        if (closestEnemy) {
          damageEnemy(closestEnemy.id, unit.damage);
          lastAttackTimes.current[unit.id] = time;

          const type = unit.class === 'Warrior' ? 'aura' : unit.class === 'Mage' ? 'sphere' : 'arrow';
          setProjectiles(prev => [
            ...prev,
            {
              id: generateId(),
              type,
              from: { ...unit.position },
              to: { ...closestEnemy!.position },
              duration: 300,
              startTime: time
            }
          ]);
        }
      }
    });

    setProjectiles(prev => prev.filter(p => performance.now() - p.startTime < p.duration));
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [units, enemies, wave, isGameOver]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isGameOver) return;
    if (e.button === 0) {
      const pos = getMouseWorldPos(e);
      
      const clickedUnit = units.find(u => {
        const dx = u.position.x - pos.x;
        const dy = u.position.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < 30;
      });

      if (clickedUnit) {
        setSelectedUnitIds([clickedUnit.id]);
        return;
      }

      const clickedEnemy = enemies.find(en => {
        const dx = en.position.x - pos.x;
        const dy = en.position.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < 30;
      });

      if (clickedEnemy) {
        setSelectedEnemyId(clickedEnemy.id);
        return;
      }

      handleMapClick();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedUnitIds.length > 0) {
      const pos = getMouseWorldPos(e);
      
      const zoneSize = 700; // 700x700으로 축소
      const minX = 1000 - zoneSize / 2;
      const maxX = 1000 + zoneSize / 2;
      const minY = 1000 - zoneSize / 2;
      const maxY = 1000 + zoneSize / 2;

      const isPosInvalid = (tx: number, ty: number, movingUnitId: string, currentUnits: any[]) => {
        if (tx < minX || tx > maxX || ty < minY || ty > maxY) return true;

        const rx = tx - minX;
        const ry = ty - minY;
        const s1 = 60, s2 = 120, s3 = 180; // 더 커진 계단 사이즈

        // Top-Left
        if (rx < s1 && ry < s3) return true;
        if (rx < s2 && ry < s2) return true;
        if (rx < s3 && ry < s1) return true;
        // Top-Right
        if (rx > zoneSize - s3 && ry < s1) return true;
        if (rx > zoneSize - s2 && ry < s2) return true;
        if (rx > zoneSize - s1 && ry < s3) return true;
        // Bottom-Left
        if (rx < s1 && ry > zoneSize - s3) return true;
        if (rx < s2 && ry > zoneSize - s2) return true;
        if (rx < s3 && ry > zoneSize - s1) return true;
        // Bottom-Right
        if (rx > zoneSize - s3 && ry > zoneSize - s1) return true;
        if (rx > zoneSize - s2 && ry > zoneSize - s2) return true;
        if (rx > zoneSize - s1 && ry > zoneSize - s3) return true;

        const MIN_DIST = 34;
        const isOverlapping = currentUnits.some(u => {
          if (u.id === movingUnitId) return false;
          const dx = u.position.x - tx;
          const dy = u.position.y - ty;
          return Math.sqrt(dx * dx + dy * dy) < MIN_DIST;
        });
        if (isOverlapping) return true;

        return false;
      };

      const findNearestFreePos = (targetX: number, targetY: number, movingUnitId: string, currentUnits: any[]) => {
        let tx = targetX;
        let ty = targetY;
        let attempts = 0;
        const maxAttempts = 100;
        let angle = 0;
        let radius = 0;

        while (attempts < maxAttempts) {
          if (!isPosInvalid(tx, ty, movingUnitId, currentUnits)) {
            return { x: tx, y: ty };
          }
          attempts++;
          angle += 0.5;
          radius = (attempts / 5) * 34;
          tx = targetX + Math.cos(angle) * radius;
          ty = targetY + Math.sin(angle) * radius;
        }
        const currentUnit = currentUnits.find(u => u.id === movingUnitId);
        return currentUnit ? { ...currentUnit.position } : { x: targetX, y: targetY };
      };

      let tempUnits = [...units];
      selectedUnitIds.forEach(id => {
        const newPos = findNearestFreePos(pos.x, pos.y, id, tempUnits);
        updateUnitPosition(id, newPos.x, newPos.y);
        tempUnits = tempUnits.map(u => u.id === id ? { ...u, position: newPos } : u);
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden relative shadow-inner"
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      style={{
        backgroundColor: '#e6f3eb',
        backgroundImage: 'radial-gradient(circle at top left, #ffffff 0%, #e6f3eb 100%)'
      }}
    >
      <div className="w-[4000px] h-[4000px] relative">
        {MAP_CENTERS.map((center, idx) => (
          <React.Fragment key={idx}>
            <MapControls x={center.x} y={center.y} playerIdx={idx} />
            <div 
              className="absolute pointer-events-none bg-[#111]"
              style={{
                left: center.x,
                top: center.y,
                transform: 'translate(-50%, -50%)',
                width: '720px',
                height: '720px',
                clipPath: STAIR_CLIP_PATH,
                zIndex: 1
              }}
            />
            <div 
              className="absolute pointer-events-none bg-[#f8f4f0] flex items-center justify-center"
              style={{
                left: center.x,
                top: center.y,
                transform: 'translate(-50%, -50%)',
                width: '700px',
                height: '700px',
                clipPath: STAIR_CLIP_PATH,
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.05)',
                zIndex: 2
              }}
            >
              {idx === 0 && (
                <div 
                  className="w-[120px] h-[120px] border-4 border-dashed border-[#dccfc4] rounded-xl flex items-center justify-center bg-white/30"
                >
                  <span className="text-[10px] font-bold text-[#8e6d46] opacity-40 uppercase">Spawn</span>
                </div>
              )}
              <span className="absolute bottom-10 text-[#cbbba9] font-bold text-5xl opacity-10 uppercase tracking-widest pointer-events-none">
                Player {idx + 1}
              </span>
            </div>
          </React.Fragment>
        ))}
        
        {monsterCount > 50 && !isGameOver && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-2xl z-[100] animate-bounce">
            ⚠️ (경고) 50마리를 넘기셨습니다!
          </div>
        )}

        {isGameOver && (
          <div className="fixed inset-0 bg-black/80 z-[1000] flex flex-col items-center justify-center gap-6">
            <h2 className="text-8xl font-black text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">GAME OVER</h2>
            <p className="text-white text-xl">몬스터가 80마리 이상 쌓였습니다.</p>
            <button 
              onClick={() => {
                resetGame();
                window.location.reload();
              }}
              className="maple-button !py-4 !px-12 !text-2xl"
            >
              다시 시작하기
            </button>
          </div>
        )}

        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`absolute w-8 h-8 rounded-md border-2 border-red-900 bg-red-600 shadow-lg flex items-center justify-center transition-all cursor-none ${
              selectedEnemyId === enemy.id ? 'ring-4 ring-red-400 scale-110' : 'hover:scale-105'
            }`}
            style={{
              left: enemy.position.x,
              top: enemy.position.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 15
            }}
          >
            <div className="absolute -top-4 left-0 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500" 
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              />
            </div>
            <span className="text-white text-[10px] font-bold">👹</span>
          </div>
        ))}

        {units.map((unit) => (
          <div
            key={unit.id}
            className={`absolute rounded-full border-2 flex items-center justify-center font-bold text-white shadow-md transition-all cursor-none ${
              selectedUnitIds.includes(unit.id) ? 'scale-125 ring-4 ring-yellow-400 border-white' : 'border-black hover:scale-110'
            }`}
            style={{
              left: unit.position.x,
              top: unit.position.y,
              transform: 'translate(-50%, -50%)',
              width: '32px',
              height: '32px',
              backgroundColor: RARITY_COLORS[unit.rarity],
              zIndex: selectedUnitIds.includes(unit.id) ? 25 : 10
            }}
          >
            <span className="text-xs pointer-events-none" style={{ textShadow: '1px 1px 0 #000' }}>
              {unit.class === 'Warrior' ? '⚔️' : unit.class === 'Mage' ? '🔮' : '🏹'}
            </span>
            {selectedUnitIds.includes(unit.id) && (
              <div 
                className="absolute rounded-full border-2 border-yellow-400/30 bg-yellow-400/5 pointer-events-none"
                style={{
                  width: unit.range * 2,
                  height: unit.range * 2,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
          </div>
        ))}

        {projectiles.map(p => {
          const progress = (performance.now() - p.startTime) / p.duration;
          const curX = p.from.x + (p.to.x - p.from.x) * progress;
          const curY = p.from.y + (p.to.y - p.from.y) * progress;

          return (
            <div 
              key={p.id}
              className={`absolute pointer-events-none ${
                p.type === 'aura' ? 'w-12 h-12 bg-yellow-400/40 rounded-full blur-md' :
                p.type === 'sphere' ? 'w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_purple]' :
                'w-1 h-6 bg-white rotate-45 border-l-2 border-gray-400'
              }`}
              style={{
                left: curX,
                top: curY,
                transform: `translate(-50%, -50%) ${p.type === 'arrow' ? `rotate(${Math.atan2(p.to.y - p.from.y, p.to.x - p.from.x) * 180 / Math.PI + 90}deg)` : ''}`,
                opacity: 1 - progress,
                zIndex: 20
              }}
            />
          );
        })}
      </div>
      
    </div>
  );
};

export default BattleField;
