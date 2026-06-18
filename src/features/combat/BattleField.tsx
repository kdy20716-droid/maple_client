import React, { useEffect, useRef, useState } from 'react';
import { useEdgePan } from '../../hooks/useEdgePan';
import { useUnitStore } from '../../store/unitStore';
import { useEnemyStore } from '../../store/enemyStore';
import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import { useRoomStore } from '../../store/roomStore';
import { useChatStore } from '../../store/chatStore';
import type { Position, Enemy, UnitRarity } from '../../types/game';
import { generateId, RARITY_COLORS, RARITY_LABELS, getBaseStats, findSpawnPosition } from '../../utils/gachaUtils';
import MapControls from './MapControls';
import { getStageConfig } from '../../utils/stageUtils';


/* ── Web Audio API 8비트 효과음 신디사이저 ── */
const playSfx = (type: 'sword' | 'magic' | 'bow' | 'hit') => {
  if (useGameStore.getState().isSfxOff) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'sword') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'magic') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'bow') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'hit') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.setValueAtTime(70, now + 0.06);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch (e) {
    console.error(e);
  }
};

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

const BattleFieldBackground: React.FC = () => {
  const wave = useGameStore(state => state.wave);
  const stageTimeLeft = useGameStore(state => state.stageTimeLeft);
  
  const stageInfo = getStageConfig(wave);
  const nextStageInfo = getStageConfig(wave + 1);

  // 3초 전부터 페이드아웃 시작 (1 ➔ 0)
  const currentOpacity = stageTimeLeft <= 3 ? Math.max(0, stageTimeLeft / 3) : 1;

  return (
    <>
      {/* 다음 스테이지 배경 (맨 뒤에 배치, 3초 전에 로딩 및 렌더링 시작) */}
      {stageTimeLeft <= 3 && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${nextStageInfo.image})`,
            backgroundSize: '2400px auto',
            backgroundRepeat: 'repeat',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* 현재 스테이지 배경 (앞에 덮어씌움, 3초간 서서히 페이드아웃) */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${stageInfo.image})`,
          backgroundSize: '2400px auto',
          backgroundRepeat: 'repeat',
          zIndex: 0,
          opacity: currentOpacity,
          pointerEvents: 'none',
          transition: stageTimeLeft > 3 ? 'none' : 'opacity 100ms linear'
        }}
      />
    </>
  );
};

const BattleField: React.FC = () => {
  const containerRef = useEdgePan({ speed: 25, margin: 150 });
  const { units, addUnit, removeUnit, updateUnitPosition } = useUnitStore();
  const { enemies, updateEnemyPositions, spawnEnemy, damageEnemy } = useEnemyStore();
  const { 
    selectedUnitIds, 
    selectedEnemyId, 
    setSelectedUnitIds, 
    setSelectedEnemyId, 
    handleMapClick, 
    scrollPos
  } = useUIStore();
  const { wave, monsterCount, isGameOver, resetGame, isBgmOff } = useGameStore();
  const { currentRoom } = useRoomStore();
  
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);

  // 마우스 드래그 선택 상태
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [dragEnd, setDragEnd] = useState<Position | null>(null);

  const lastSpawnTime = useRef(performance.now());
  const lastAttackTimes = useRef<Record<string, number>>({});
  const requestRef = useRef<number | undefined>(undefined);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // 현재 방에 있는 실제 플레이어 수 확인
  const playerSlots = currentRoom?.slots.filter(s => s.status === 'PLAYER') || [{ id: 1, playerName: '나(방장)' }];
  const playerCount = playerSlots.length;

  const triggerHeroSelection = (playerId: number, chosenType: 'Warrior' | 'Mage' | 'Archer' | 'Random' | 'Gold') => {
    const { addMessage } = useChatStore.getState();

    if (chosenType === 'Gold') {
      if (playerId === 1) {
        useGameStore.getState().addGold(50);
      }
      removeUnit(`gimmick-hero-P${playerId}`);
      const sep = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      addMessage(sep, '#fbbf24');
      addMessage(`[선택권] P${playerId}님이 [💰 50골드 지원 💰]을 선택하여 50골드를 획득했습니다!`, '#fbbf24');
      addMessage(sep, '#fbbf24');
      return;
    }

    const center = MAP_CENTERS[playerId - 1];
    if (!center) return;

    let rarity: UnitRarity = 'Hero';
    let unitClass: 'Warrior' | 'Mage' | 'Archer' = 'Warrior';

    if (chosenType === 'Random') {
      const rand = Math.random() * 100;
      if (rand < 0.5) rarity = 'Apocalypse';
      else if (rand < 5.0) rarity = 'Primeval';
      else if (rand < 25.0) rarity = 'Mythic';
      else rarity = 'Hero';

      unitClass = (['Warrior', 'Mage', 'Archer'] as const)[Math.floor(Math.random() * 3)];
    } else {
      rarity = 'Hero';
      unitClass = chosenType;
    }

    const stats = getBaseStats(rarity, unitClass);
    const unitLabel = RARITY_LABELS[rarity];
    const unitName = `${unitLabel} ${unitClass}`;

    const spawnPos = findSpawnPosition(center.x, center.y, useUnitStore.getState().units, 34);
    
    addUnit({
      id: generateId(),
      name: unitName,
      rarity,
      class: unitClass,
      damage: stats.damage,
      attackSpeed: stats.attackSpeed,
      range: stats.range,
      position: spawnPos,
    });

    // 선택권 유닛 삭제
    removeUnit(`gimmick-hero-P${playerId}`);

    const color = RARITY_COLORS[rarity];
    const sep = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    addMessage(sep, color);
    addMessage(`[선택권] P${playerId}님이 [★ ${unitLabel} ${unitClass} ★]을(를) 선택/소환했습니다!`, color);
    addMessage(sep, color);
  };

  // 기믹별 초기 아바타 위치 계산기 (중심 좌표에 따른 U자 배치 분산 및 영웅선택권 배치)
  const getAvatarInitPos = (playerId: number, gimmickType: 'bgm' | 'speed' | 'sfx' | 'hero', state: 'left' | 'right') => {
    let cx = 2000;
    let cy = 2000;
    if (gimmickType === 'bgm') { cx = 1650; cy = 1700; }
    else if (gimmickType === 'speed') { cx = 2000; cy = 1950; }
    else if (gimmickType === 'sfx') { cx = 2350; cy = 1700; }
    else if (gimmickType === 'hero') { cx = 2000; cy = 2370; } // 2x5 레이아웃 하단 3번째 칸(가운데) Y: 2370

    if (gimmickType === 'hero') {
      // 선택권 유닛은 하단 가운데(3번째 칸)에 나란히 배치
      return {
        x: cx - 30 + (playerId - 1) * 20,
        y: cy
      };
    }

    const ox = state === 'left' ? -60 : 60;
    return {
      x: cx + ox + (playerId - 1) * 15,
      y: cy - 20 + (playerId - 1) * 12
    };
  };

  // 1. 기믹 유닛 초기 자동 소환 (마운트 시)
  useEffect(() => {
    const hasGimmick = units.some(u => u.isGimmickUnit);
    if (!hasGimmick) {
      (['bgm', 'speed', 'sfx', 'hero'] as const).forEach(type => {
        playerSlots.forEach(slot => {
          const pos = getAvatarInitPos(slot.id, type, 'left');
          const korName = 
            type === 'bgm' ? 'BGM 설정' : 
            type === 'speed' ? '배속 설정' : 
            type === 'sfx' ? 'SFX 설정' : '영웅 선택권';
          addUnit({
            id: `gimmick-${type}-P${slot.id}`,
            name: `${korName} (P${slot.id})`,
            rarity: 'Normal',
            class: 'Warrior',
            damage: 0,
            attackSpeed: 99999,
            range: 0,
            position: pos,
            isGimmickUnit: true,
            playerId: slot.id
          });
        });
      });
    }
  }, [playerSlots, addUnit, units]);

  // 2. 메이플 로그인 BGM 재생 루프
  useEffect(() => {
    const audio = new Audio('https://archive.org/download/maplestorymusic/01-Login.mp3');
    audio.loop = true;
    audio.volume = 0.15; 
    bgmRef.current = audio;

    const playBgm = () => {
      if (!useGameStore.getState().isBgmOff) {
        audio.play().catch(() => {});
      }
    };

    playBgm();
    window.addEventListener('click', playBgm, { once: true });

    return () => {
      window.removeEventListener('click', playBgm);
      audio.pause();
      bgmRef.current = null;
    };
  }, []);

  // 미니맵 클릭이나 외부 스크롤 포지션 변경 시 DOM 컨테이너 스크롤 동기화
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      if (Math.abs(container.scrollLeft - scrollPos.x) > 2) {
        container.scrollLeft = scrollPos.x;
      }
      if (Math.abs(container.scrollTop - scrollPos.y) > 2) {
        container.scrollTop = scrollPos.y;
      }
    }
  }, [scrollPos]);

  // BGM 뮤트 동기화
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.muted = isBgmOff;
      if (!isBgmOff) {
        bgmRef.current.play().catch(() => {});
      }
    }
  }, [isBgmOff]);

  // 3. 기믹 유닛들의 실시간 위치를 감지하여 게임 배속/오디오 스토어 상태 갱신
  useEffect(() => {
    const gimmickUnits = units.filter(u => u.isGimmickUnit && u.playerId && u.playerId <= playerCount);
    if (gimmickUnits.length === 0) return;

    const speedUnits = gimmickUnits.filter(u => u.id.includes('speed'));
    const bgmUnit = gimmickUnits.find(u => u.id.includes('bgm') && u.playerId === 1);
    const sfxUnit = gimmickUnits.find(u => u.id.includes('sfx') && u.playerId === 1);

    const { setGameSpeed, setBgmOff, setSfxOff } = useGameStore.getState();

    // 3-1. 배속: 모든 기믹 SPEED 유닛이 해당 구역의 중심 X:2000 보다 우측(x4 영역)에 있으면 4배속, 아니면 2배속
    const allInX4 = speedUnits.length > 0 && speedUnits.every(u => u.position.x >= 2000);
    setGameSpeed(allInX4 ? 4 : 2);

    // 3-2. BGM: 내 BGM 유닛의 X 좌표가 BGM 구역 중심 X:1650 보다 우측이면 OFF, 아니면 ON
    if (bgmUnit) {
      setBgmOff(bgmUnit.position.x >= 1650);
    }

    // 3-3. SFX: 내 SFX 유닛의 X 좌표가 SFX 구역 중심 X:2350 보다 우측이면 OFF, 아니면 ON
    if (sfxUnit) {
      setSfxOff(sfxUnit.position.x >= 2350);
    }
  }, [units, playerCount]);

  // 가상 플레이어 토글 버튼 핸들러 (units 스냅 좌표 강제 갱신)
  const handleVirtualToggle = (playerId: number, gimmickType: 'bgm' | 'speed' | 'sfx', toState: 'left' | 'right') => {
    const snap = getAvatarInitPos(playerId, gimmickType, toState);
    const targetId = `gimmick-${gimmickType}-P${playerId}`;
    updateUnitPosition(targetId, snap.x, snap.y);
  };

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

    const speedMultiplier = useGameStore.getState().gameSpeed; // 2 또는 4
    const deltaTime = 0.016; 
    
    // 매 프레임마다 스테이지 남은 시간 차감 (2배속: 2x속도, 4배속: 4x속도)
    useGameStore.getState().tickStageTime(deltaTime * speedMultiplier);

    // 기본 배속인 2배속일 때 deltaTime * 100, 4배속일 때 deltaTime * 200으로 적 이동 속도 가속화
    updateEnemyPositions(deltaTime * 50 * speedMultiplier, P1_WAYPOINTS);

    // 스테이지 별 스폰 대기 설정: 초반(Wave 1)은 20초간 대기, 이후(Wave > 1)는 10초간 대기
    const gameState = useGameStore.getState();
    const currentWave = gameState.wave;
    const currentStageTimeLeft = gameState.stageTimeLeft;
    const isSpawningAllowed = currentWave === 1 ? currentStageTimeLeft <= 120 : currentStageTimeLeft <= 130;

    if (!isSpawningAllowed) {
      // 스폰 대기 시간 동안은 소환 시간(lastSpawnTime) 기준점 동기화 유지
      lastSpawnTime.current = time;
    } else {
      const spawnInterval = 1500 / (speedMultiplier / 2);
      if (time - lastSpawnTime.current > spawnInterval) {
        spawnEnemy({
          id: generateId(),
          name: `Wave ${currentWave} Slime`,
          hp: 30 + currentWave * 20,
          maxHp: 30 + currentWave * 20,
          shield: currentWave > 10 ? (currentWave - 10) * 10 : 0,
          maxShield: currentWave > 10 ? (currentWave - 10) * 10 : 0,
          speed: 1,
          position: { ...P1_WAYPOINTS[0] },
          reward: 5,
          waypointIndex: 1,
        });
        lastSpawnTime.current = time;
      }
    }

    units.forEach(unit => {
      // 기믹용 설정 아바타 유닛은 공격을 하지 않음
      if (unit.isGimmickUnit) return;

      const lastAttack = lastAttackTimes.current[unit.id] || 0;
      const attackInterval = (unit.attackSpeed * 1000) / (speedMultiplier / 2);
      if (time - lastAttack > attackInterval) {
        let closestEnemy: Enemy | null = null;
        let minDistance = unit.range;

        for (const enemy of enemies) {
          const dx = enemy.position.x - unit.position.x;
          const dy = enemy.position.y - unit.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            minDistance = dist;
            closestEnemy = enemy;
          }
        }

        if (closestEnemy) {
          damageEnemy((closestEnemy as Enemy).id, unit.damage);
          lastAttackTimes.current[unit.id] = time;

          // 8비트 효과음 재생
          const sfxType = unit.class === 'Warrior' ? 'sword' : unit.class === 'Mage' ? 'magic' : 'bow';
          playSfx(sfxType);
          setTimeout(() => playSfx('hit'), 150);

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

  // 마우스 드래그 선택 및 업 전역 핸들러
  useEffect(() => {
    if (!dragStart) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = {
        x: e.clientX - rect.left + scrollPos.x,
        y: e.clientY - rect.top + scrollPos.y
      };
      setDragEnd(pos);
    };

    const handleGlobalMouseUp = () => {
      if (!dragStart || !dragEnd) {
        setDragStart(null);
        setDragEnd(null);
        return;
      }

      const startX = dragStart.x;
      const startY = dragStart.y;
      const endX = dragEnd.x;
      const endY = dragEnd.y;

      const dx = Math.abs(endX - startX);
      const dy = Math.abs(endY - startY);

      if (dx < 8 && dy < 8) {
        // 단일 클릭 처리
        const pos = dragStart;
        
        const clickedUnit = units.find(u => {
          const udx = u.position.x - pos.x;
          const udy = u.position.y - pos.y;
          return Math.sqrt(udx * udx + udy * udy) < 30;
        });

        if (clickedUnit) {
          if (clickedUnit.isGimmickUnit && clickedUnit.playerId !== 1) {
            setDragStart(null);
            setDragEnd(null);
            return;
          }
          setSelectedUnitIds([clickedUnit.id]);
          setDragStart(null);
          setDragEnd(null);
          return;
        }

        const clickedEnemy = enemies.find(en => {
          const edx = en.position.x - pos.x;
          const edy = en.position.y - pos.y;
          return Math.sqrt(edx * edx + edy * edy) < 30;
        });

        if (clickedEnemy) {
          setSelectedEnemyId(clickedEnemy.id);
          setDragStart(null);
          setDragEnd(null);
          return;
        }

        handleMapClick();
      } else {
        // 다중 드래그 박스 선택 처리
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);

        const unitsInBox = units.filter(u => {
          // 기믹 및 설정 유닛들은 다중 드래그 이동 선택에서 제외하여 사용자 편의성 제공
          if (u.isGimmickUnit) return false;
          return u.position.x >= minX && u.position.x <= maxX && u.position.y >= minY && u.position.y <= maxY;
        });

        if (unitsInBox.length > 0) {
          setSelectedUnitIds(unitsInBox.map(u => u.id));
        } else {
          handleMapClick();
        }
      }

      setDragStart(null);
      setDragEnd(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragStart, dragEnd, units, enemies, scrollPos, setSelectedUnitIds, setSelectedEnemyId, handleMapClick]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isGameOver) return;
    if (e.button === 0) {
      // 텍스트 블록 선택 방지
      e.preventDefault();
      const pos = getMouseWorldPos(e);
      setDragStart(pos);
      setDragEnd(pos);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedUnitIds.length > 0) {
      const pos = getMouseWorldPos(e);
      
      // 기믹 설정 유닛이 선택되어 있는지 확인
      const activeGimmickUnit = units.find(u => selectedUnitIds.includes(u.id) && u.isGimmickUnit);

      if (activeGimmickUnit) {
        // 내 기믹 유닛만 이동 가능
        if (activeGimmickUnit.playerId !== 1) return;

        const id = activeGimmickUnit.id;
        const gimmickType = 
          id.includes('bgm') ? 'bgm' : 
          id.includes('speed') ? 'speed' : 
          id.includes('sfx') ? 'sfx' : 'hero';

        let targetCx = 2000;
        let targetCy = 2000;
        if (gimmickType === 'bgm') { targetCx = 1650; targetCy = 1700; }
        else if (gimmickType === 'speed') { targetCx = 2000; targetCy = 1950; }
        else if (gimmickType === 'sfx') { targetCx = 2350; targetCy = 1700; }
        else if (gimmickType === 'hero') { targetCx = 2000; targetCy = 2300; }

        if (gimmickType === 'hero') {
          // 영웅 선택권 직사각형 내부 Clamping (가로 520, 세로 280 / 내부 범위 가로 240, 세로 120)
          const clampedX = Math.max(targetCx - 240, Math.min(targetCx + 240, pos.x));
          const clampedY = Math.max(targetCy - 120, Math.min(targetCy + 120, pos.y));
          
          updateUnitPosition(id, clampedX, clampedY);

          // 상단 행(Y < 2300)으로 올라갔을 때만 선택 확정 및 보상 처리
          if (clampedY < 2300) {
            let chosenType: 'Warrior' | 'Mage' | 'Archer' | 'Random' = 'Random';
            if (clampedX < 1870) chosenType = 'Warrior';
            else if (clampedX < 2000) chosenType = 'Mage';
            else if (clampedX < 2130) chosenType = 'Archer';
            else chosenType = 'Random';

            // 0.2초 딜레이 후에 획득 처리 (이동 시각적 연출을 위한 딜레이)
            setTimeout(() => {
              triggerHeroSelection(1, chosenType);
            }, 200);
          }

          return;
        }

        // 직사각형 내부 Clamping (가로 280, 세로 220 / 내부 유닛 범위 마진고려 가로 120, 세로 90)
        const clampedX = Math.max(targetCx - 120, Math.min(targetCx + 120, pos.x));
        const clampedY = Math.max(targetCy - 90, Math.min(targetCy + 90, pos.y));

        updateUnitPosition(id, clampedX, clampedY);
        return; // 일반 유닛 이동 로직 바이패스
      }

      // 일반 전투 유닛 이동 제한 (Player 1 맵 영역)
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

      let tempUnits = [...useUnitStore.getState().units];
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
      <div 
        className="w-[4000px] h-[4000px] relative"
      >
        {/* ── 배경 페이드아웃 및 다음 맵 대기 레이어 ── */}
        <BattleFieldBackground />

        {/* 마우스 드래그 선택 박스 오버레이 */}
        {dragStart && dragEnd && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(dragStart.x, dragEnd.x)}px`,
              top: `${Math.min(dragStart.y, dragEnd.y)}px`,
              width: `${Math.abs(dragStart.x - dragEnd.x)}px`,
              height: `${Math.abs(dragStart.y - dragEnd.y)}px`,
              border: '1.5px solid #00f0ff',
              background: 'rgba(0, 240, 255, 0.12)',
              boxShadow: '0 0 8px rgba(0, 240, 255, 0.4)',
              pointerEvents: 'none',
              zIndex: 200
            }}
          />
        )}
        {/* ── [U자형 배치] 기믹 구역 A: BGM Control (X: 1650, Y: 1700) ── */}
        <div 
          style={{
            position: 'absolute',
            left: '1650px',
            top: '1700px',
            transform: 'translate(-50%, -50%)',
            width: '280px',
            height: '220px',
            zIndex: 3,
            border: '2px solid #111',
            borderRadius: '6px',
            background: '#f8f4f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 0 20px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 10px 12px',
            boxSizing: 'border-box'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ color: '#8e6d46', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', fontFamily: '"Gulim", sans-serif' }}>
            🍁 BGM CONTROL 🍁
          </div>
          <div style={{ position: 'absolute', top: '45px', bottom: '45px', left: '50%', width: '2px', borderLeft: '1.5px dashed #dccfc4', transform: 'translateX(-50%)' }} />

          {playerCount > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', alignItems: 'center', zIndex: 2 }}>
              {playerSlots.map(slot => {
                if (slot.id === 1) return null;
                const unitId = `gimmick-bgm-P${slot.id}`;
                const av = units.find(u => u.id === unitId);
                const isOff = av && av.position.x >= 1650;
                return (
                  <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: '#555', fontFamily: '"Gulim", sans-serif' }}>
                    <span>🍄 P{slot.id}:</span>
                    <button onClick={() => handleVirtualToggle(slot.id, 'bgm', 'left')} style={{ padding: '1px 4px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: !isOff ? '#8b5e2e' : '#fff', color: !isOff ? '#fff' : '#555', outline: 'none' }}>ON</button>
                    <button onClick={() => handleVirtualToggle(slot.id, 'bgm', 'right')} style={{ padding: '1px 4px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: isOff ? '#8b5e2e' : '#fff', color: isOff ? '#fff' : '#555', outline: 'none' }}>OFF</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── [U자형 배치] 기믹 구역 B: SFX Control (X: 2350, Y: 1700) ── */}
        <div 
          style={{
            position: 'absolute',
            left: '2350px',
            top: '1700px',
            transform: 'translate(-50%, -50%)',
            width: '280px',
            height: '220px',
            zIndex: 3,
            border: '2px solid #111',
            borderRadius: '6px',
            background: '#f8f4f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 0 20px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 10px 12px',
            boxSizing: 'border-box'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ color: '#8e6d46', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', fontFamily: '"Gulim", sans-serif' }}>
            🔊 SFX CONTROL 🔊
          </div>
          <div style={{ position: 'absolute', top: '45px', bottom: '45px', left: '50%', width: '2px', borderLeft: '1.5px dashed #dccfc4', transform: 'translateX(-50%)' }} />

          {/* SFX ON/OFF 글씨 제거 */}
          
          {playerCount > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', alignItems: 'center', zIndex: 2 }}>
              {playerSlots.map(slot => {
                if (slot.id === 1) return null;
                const unitId = `gimmick-sfx-P${slot.id}`;
                const av = units.find(u => u.id === unitId);
                const isOff = av && av.position.x >= 2350;
                return (
                  <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: '#555', fontFamily: '"Gulim", sans-serif' }}>
                    <span>🐌 P{slot.id}:</span>
                    <button onClick={() => handleVirtualToggle(slot.id, 'sfx', 'left')} style={{ padding: '1px 4px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: !isOff ? '#8b5e2e' : '#fff', color: !isOff ? '#fff' : '#555', outline: 'none' }}>ON</button>
                    <button onClick={() => handleVirtualToggle(slot.id, 'sfx', 'right')} style={{ padding: '1px 4px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: isOff ? '#8b5e2e' : '#fff', color: isOff ? '#fff' : '#555', outline: 'none' }}>OFF</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── [U자형 배치] 기믹 구역 C: SPEED Control (X: 2000, Y: 1950) ── */}
        <div 
          style={{
            position: 'absolute',
            left: '2000px',
            top: '1950px',
            transform: 'translate(-50%, -50%)',
            width: '280px',
            height: '220px',
            zIndex: 3,
            border: '2px solid #111',
            borderRadius: '6px',
            background: '#f8f4f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 0 20px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 10px 12px',
            boxSizing: 'border-box'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ color: '#8e6d46', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', fontFamily: '"Gulim", sans-serif' }}>
            ⚡ GAME SPEED ⚡
          </div>
          <div style={{ position: 'absolute', top: '45px', bottom: '45px', left: '50%', width: '2px', borderLeft: '1.5px dashed #dccfc4', transform: 'translateX(-50%)' }} />

          {/* x2/x4 배속 글씨 제거 */}
          
          {playerCount > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', alignItems: 'center', zIndex: 2 }}>
              {playerSlots.map(slot => {
                if (slot.id === 1) return null;
                const unitId = `gimmick-speed-P${slot.id}`;
                const av = units.find(u => u.id === unitId);
                const isFast = av && av.position.x >= 2000;
                return (
                  <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: '#555', fontFamily: '"Gulim", sans-serif' }}>
                    <span>🐷 P{slot.id}:</span>
                    <button onClick={() => handleVirtualToggle(slot.id, 'speed', 'left')} style={{ padding: '1px 4px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: !isFast ? '#8b5e2e' : '#fff', color: !isFast ? '#fff' : '#555', outline: 'none' }}>x2</button>
                    <button onClick={() => handleVirtualToggle(slot.id, 'speed', 'right')} style={{ padding: '1px 4px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: isFast ? '#8b5e2e' : '#fff', color: isFast ? '#fff' : '#555', outline: 'none' }}>x4</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 기믹 구역 D: Hero Selection Panel (X: 2000, Y: 2300, 4x2 Grid) ── */}
        <div 
          style={{
            position: 'absolute',
            left: '2000px',
            top: '2300px',
            transform: 'translate(-50%, -50%)',
            width: '520px',
            height: '280px',
            zIndex: 3,
            border: '2px solid #111',
            borderRadius: '8px',
            background: '#f8f4f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 0 25px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            overflow: 'visible'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Floating Header */}
          <div style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#8e6d46',
            color: '#fff',
            border: '2px solid #111',
            borderRadius: '12px',
            padding: '3px 20px',
            fontSize: '11px',
            fontWeight: 'bold',
            fontFamily: '"Gulim", sans-serif',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 5,
            whiteSpace: 'nowrap'
          }}>
            🍁 영웅 선택 및 랜덤 뽑기 구역 (4x2) 🍁
          </div>

          {/* 4x2 Grid */}
          <div style={{
            display: 'grid',
            gridTemplateRows: '1fr 1fr',
            gridTemplateColumns: 'repeat(4, 1fr)',
            width: '100%',
            height: '100%',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            {/* ── ROW 1: Options (Y < 2300) ── */}
            {/* Col 1: Warrior */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              textAlign: 'center',
              padding: '10px 5px',
              background: '#fffbf0',
              borderRight: '1px dashed #dccfc4',
              borderBottom: '2px solid #111',
              boxSizing: 'border-box'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#cc3030' }}>⚔️ 영웅 전사</span>
            </div>

            {/* Col 2: Mage */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              textAlign: 'center',
              padding: '10px 5px',
              background: '#fbf0ff',
              borderRight: '1px dashed #dccfc4',
              borderBottom: '2px solid #111',
              boxSizing: 'border-box'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#8844cc' }}>🔮 영웅 마법사</span>
            </div>

            {/* Col 3: Archer */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              textAlign: 'center',
              padding: '10px 5px',
              background: '#f0fff5',
              borderRight: '1px dashed #dccfc4',
              borderBottom: '2px solid #111',
              boxSizing: 'border-box'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#229944' }}>🏹 영웅 궁수</span>
            </div>

            {/* Col 4: Random */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              textAlign: 'center',
              padding: '10px 5px',
              background: '#fff5eb',
              borderBottom: '2px solid #111',
              boxSizing: 'border-box'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#b07820' }}>🎁 랜덤 뽑기</span>
            </div>

            {/* ── ROW 2: Combined Summon & Waiting Slot (Y >= 2300, No vertical dividers) ── */}
            <div style={{
              gridColumn: 'span 4',
              background: '#e6f2ff',
              boxSizing: 'border-box',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}>
              {/* Inner dashed border to indicate summon pad */}
              <div style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '20px',
                right: '20px',
                border: '2px dashed #3182ce',
                borderRadius: '6px',
                pointerEvents: 'none'
              }} />
              <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#2b6cb0', zIndex: 1, letterSpacing: '1.5px' }}>🎫 영웅 선택권 소환 및 대기 구역</span>
            </div>
          </div>

          {/* Bottom Overlay for Controls / Instructions */}
          {playerCount > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 4,
              pointerEvents: 'auto',
              background: 'rgba(248, 244, 240, 0.85)',
              padding: '2px 10px',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '9px', color: '#555' }}>
                {playerSlots.map(slot => {
                  if (slot.id === 1) return null;
                  const hasVoucher = units.some(u => u.id === `gimmick-hero-P${slot.id}`);
                  if (!hasVoucher) {
                    return (
                      <div key={slot.id} style={{ color: '#aaa', fontStyle: 'italic' }}>
                        👤 P{slot.id}: 선택 완료
                      </div>
                    );
                  }
                  return (
                    <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span>👤 P{slot.id}:</span>
                      <button onClick={() => triggerHeroSelection(slot.id, 'Warrior')} style={{ padding: '1px 3px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: '#fff' }}>⚔️</button>
                      <button onClick={() => triggerHeroSelection(slot.id, 'Mage')} style={{ padding: '1px 3px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: '#fff' }}>🔮</button>
                      <button onClick={() => triggerHeroSelection(slot.id, 'Archer')} style={{ padding: '1px 3px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: '#fff' }}>🏹</button>
                      <button onClick={() => triggerHeroSelection(slot.id, 'Random')} style={{ padding: '1px 3px', fontSize: '8px', cursor: 'pointer', border: '1px solid #cbbba9', background: '#fb923c', color: '#fff', fontWeight: 'bold' }}>🎲</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                left: center.x,
                top: center.y,
                transform: 'translate(-50%, -50%)',
                width: '700px',
                height: '700px',
                clipPath: STAIR_CLIP_PATH,
                backgroundColor: '#faf9f6',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.06)',
                zIndex: 2
              }}
            >
              <div 
                className="w-[120px] h-[120px] border-4 border-dashed rounded-xl flex flex-col items-center justify-center bg-white/30 pointer-events-none"
                style={{
                  borderColor: idx === 0 ? '#ff3333' : idx === 1 ? '#3388ff' : idx === 2 ? '#55ff55' : '#cc55ff',
                }}
              >
                <span 
                  className="text-lg font-black uppercase tracking-wider"
                  style={{
                    color: idx === 0 ? '#ff3333' : idx === 1 ? '#3388ff' : idx === 2 ? '#55ff55' : '#cc55ff',
                  }}
                >
                  P{idx + 1}
                </span>
                <span 
                  className="text-[9px] font-bold uppercase tracking-wider opacity-60"
                  style={{
                    color: idx === 0 ? '#ff3333' : idx === 1 ? '#3388ff' : idx === 2 ? '#55ff55' : '#cc55ff',
                  }}
                >
                  Spawn
                </span>
              </div>
              <span 
                className="absolute bottom-10 font-bold text-6xl opacity-15 uppercase tracking-widest pointer-events-none"
                style={{
                  color: idx === 0 ? '#ff3333' : idx === 1 ? '#3388ff' : idx === 2 ? '#55ff55' : '#cc55ff',
                  fontFamily: '"Gulim", sans-serif',
                  textShadow: '0 0 10px rgba(0,0,0,0.1)'
                }}
              >
                P{idx + 1}
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

        {units.map((unit) => {
          const isSelected = selectedUnitIds.includes(unit.id);
          const isGimmick = unit.isGimmickUnit;
          
          // 기능 직관성을 위한 기믹 유닛 이모지 매핑
          let gimmickEmoji = '🎵'; // Default BGM
          if (unit.id.includes('sfx')) gimmickEmoji = '🔊';
          else if (unit.id.includes('speed')) gimmickEmoji = '⚡';
          else if (unit.id.includes('hero')) gimmickEmoji = '🎫';

          return (
            <div
              key={unit.id}
              className={`absolute rounded-full border-2 flex items-center justify-center font-bold text-white shadow-md transition-all cursor-none ${
                isSelected ? 'scale-125 ring-4 ring-yellow-400 border-white' : 'border-black hover:scale-110'
              }`}
              style={{
                left: unit.position.x,
                top: unit.position.y,
                transform: 'translate(-50%, -50%)',
                width: '32px',
                height: '32px',
                backgroundColor: isGimmick ? '#f8f4f0' : RARITY_COLORS[unit.rarity],
                borderColor: isGimmick ? (unit.playerId === 1 ? '#ff3333' : unit.playerId === 2 ? '#3388ff' : unit.playerId === 3 ? '#55ff55' : '#cc55ff') : 'black',
                zIndex: isSelected ? 25 : 10
              }}
            >
              <span className="text-xs pointer-events-none" style={{ textShadow: isGimmick ? 'none' : '1px 1px 0 #000' }}>
                {isGimmick ? gimmickEmoji : (unit.class === 'Warrior' ? '⚔️' : unit.class === 'Mage' ? '🔮' : '🏹')}
              </span>
              
              {/* 플레이어 식별 꼬마 배지 (우측 상단) */}
              {isGimmick && (
                <div 
                  className="absolute -top-1.5 -right-1.5 text-[8px] font-black text-white rounded-full flex items-center justify-center pointer-events-none border border-white"
                  style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: unit.playerId === 1 ? '#ff3333' : unit.playerId === 2 ? '#3388ff' : unit.playerId === 3 ? '#55ff55' : '#cc55ff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    transform: 'scale(0.85)',
                    lineHeight: '14px'
                  }}
                >
                  P{unit.playerId}
                </div>
              )}

              {isSelected && !isGimmick && (
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
          );
        })}

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
