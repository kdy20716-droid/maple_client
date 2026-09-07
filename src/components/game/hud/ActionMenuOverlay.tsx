import React, { useState } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useUnitStore } from '../../../store/unitStore';
import { useGameStore } from '../../../store/gameStore';
import { useChatStore } from '../../../store/chatStore';
import type { UnitRarity, UnitClass } from '../../../types/game';
import { getBaseStats, generateId, RARITY_LABELS, RARITY_COLORS, getUnitSellValue } from '../../../utils/gachaUtils';

interface ActionButtonProps {
  icon: string;
  label: string;
  count: number;
  mineralValue: number;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, count, mineralValue, onClick, disabled }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const finalDisabled = disabled || count === 0;

  return (
    <button
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
      disabled={finalDisabled}
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #3a2212, #21130a)',
        border: '2px solid #5a3c24',
        borderRadius: '4px',
        color: finalDisabled ? '#888' : '#f0d080',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: finalDisabled ? 'not-allowed' : 'pointer',
        opacity: finalDisabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        fontFamily: '"Gulim", "Dotum", sans-serif',
        position: 'relative',
        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.5)',
      }}
      onMouseOver={(e) => {
        if (!finalDisabled) {
          e.currentTarget.style.border = '2px solid #ffcc00';
          e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 204, 0, 0.4)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.border = '2px solid #5a3c24';
        e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.5)';
      }}
    >
      {/* 이모지 아이콘 */}
      <span style={{ fontSize: '20px', marginBottom: '2px' }}>{icon}</span>

      {/* 라벨 텍스트 */}
      <span style={{ fontSize: '10px', fontWeight: 'bold', textShadow: '1px 1px 1px #000' }}>
        {label}
        {count > 0 && <span style={{ color: '#ffcc00', marginLeft: '3px' }}>({count})</span>}
      </span>

      {/* 메이플 스타일 툴팁 팝업 */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.85)',
            border: '2px solid #8b5e2e',
            borderRadius: '4px',
            padding: '8px 12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
            color: '#fff',
            zIndex: 999,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffcc00', textShadow: '1px 1px 1px #000' }}>
            {label} {count > 0 ? `(${count}개 선택됨)` : ''}
          </div>
          {count > 0 ? (
            <>
              <div style={{ height: '1px', background: '#5a3c24', margin: '3px 0' }} />
              <div style={{ fontSize: '10px', color: '#ddccaa' }}>
                판매 시 획득 미네랄: <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{mineralValue} M</span>
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>클릭 시 즉시 판매됩니다.</div>
            </>
          ) : (
            <div style={{ fontSize: '9px', color: '#aaa' }}>
              {disabled ? '잠겨 있는 기능입니다.' : '판매할 대상을 먼저 선택해주세요.'}
            </div>
          )}
        </div>
      )}
    </button>
  );
};

const ActionMenuOverlay: React.FC = () => {
  const { selectedUnitIds, setSelectedUnitIds } = useUIStore();
  const { units, removeUnit } = useUnitStore();
  const { addMineral } = useGameStore();
  const { addMessage } = useChatStore();

  // 선택된 유닛들 정보 필터링 (기믹 옵션 유닛 제외)
  const selectedUnits = units.filter((u) => selectedUnitIds.includes(u.id) && !u.isGimmickUnit);

  // 직업별 유닛 분류
  const ghostUnits = selectedUnits.filter((u) => u.class === 'Ghost');
  const dragoonUnits = selectedUnits.filter((u) => u.class === 'Dragoon');
  const hydraUnits = selectedUnits.filter((u) => u.class === 'Hydra');

  // 직업별 판매 획득 총 미네랄 계산 (공식 메운디 판매가 적용)
  const getMineralValue = (targetUnits: typeof units) => {
    return targetUnits.reduce((sum, u) => sum + getUnitSellValue(u.rarity), 0);
  };

  const ghostMineral = getMineralValue(ghostUnits);
  const dragoonMineral = getMineralValue(dragoonUnits);
  const hydraMineral = getMineralValue(hydraUnits);

  // 판매 처리 로직
  const handleSell = (unitClass: UnitClass, targetUnits: typeof units, mineralEarned: number) => {
    if (targetUnits.length === 0) return;

    // 1. 유닛 제거
    targetUnits.forEach((u) => removeUnit(u.id));

    // 2. 미네랄 획득
    addMineral(mineralEarned);

    // 3. 선택 목록 갱신 (제거된 유닛들을 선택 해제)
    const soldIds = targetUnits.map((u) => u.id);
    const nextSelected = selectedUnitIds.filter((id) => !soldIds.includes(id));
    setSelectedUnitIds(nextSelected);

    // 4. 알림 시스템 메시지 출력
    const classKor = unitClass === 'Ghost' ? '고스트' : unitClass === 'Dragoon' ? '드라군' : '히드라';
    addMessage(
      `[시스템] ${classKor} ${targetUnits.length}마리를 판매하여 ${mineralEarned} 미네랄을 획득하였습니다.`,
      '#38bdf8'
    );
  };

  // 유닛 합성(Combine) 가능 여부 체크
  // 선택된 유닛 중 같은 등급 3기 이상인 그룹 찾기
  const rarityCounts: Partial<Record<UnitRarity, typeof selectedUnits>> = {};
  selectedUnits.forEach(u => {
    if (!rarityCounts[u.rarity]) rarityCounts[u.rarity] = [];
    rarityCounts[u.rarity]!.push(u);
  });

  const combinableRarity = (Object.keys(rarityCounts) as UnitRarity[]).find(
    r => r !== 'Primeval' && (rarityCounts[r]?.length || 0) >= 3
  );

  const combinableUnits = combinableRarity ? rarityCounts[combinableRarity]!.slice(0, 3) : [];

  const handleCombine = () => {
    if (!combinableRarity || combinableUnits.length < 3) return;

    const NEXT_RARITY: Record<UnitRarity, UnitRarity> = {
      Common: 'Rare',
      Rare: 'Ancient',
      Ancient: 'Artifact',
      Artifact: 'Narrative',
      Narrative: 'Legendary',
      Legendary: 'Epic',
      Epic: 'Mythic',
      Mythic: 'Primeval',
      Primeval: 'Primeval',
    };

    const nextRarity = NEXT_RARITY[combinableRarity];
    const baseUnit = combinableUnits[0];
    const spawnPos = { ...baseUnit.position };

    // 1. 재료 3기 제거
    combinableUnits.forEach(u => removeUnit(u.id));

    // 2. 상위 1기 생성
    const stats = getBaseStats(nextRarity, baseUnit.class);
    const unitClassName = baseUnit.class === 'Ghost' ? '고스트' : baseUnit.class === 'Dragoon' ? '드라군' : '히드라';
    const newName = `${RARITY_LABELS[nextRarity]} ${unitClassName}`;

    useUnitStore.getState().addUnit({
      id: generateId(),
      name: newName,
      rarity: nextRarity,
      class: baseUnit.class,
      attackType: stats.attackType,
      damage: stats.damage,
      attackSpeed: stats.attackSpeed,
      range: stats.range,
      position: spawnPos,
    });

    // 3. 선택 목록 갱신
    const removedIds = combinableUnits.map(u => u.id);
    setSelectedUnitIds(selectedUnitIds.filter(id => !removedIds.includes(id)));

    // 4. 알림 메시지
    const color = RARITY_COLORS[nextRarity];
    addMessage(`[합성 성공] ${RARITY_LABELS[combinableRarity]} 3기를 합성하여 [★ ${newName} ★]을(를) 획득했습니다!`, color);
  };

  const { setGachaModalOpen, setUpgradeModalOpen } = useUIStore();

  return (
    <div
      data-no-pan="true"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        zIndex: 30,
        width: '20vw',
        height: '20vw',
        minWidth: '220px',
        minHeight: '200px',
        maxHeight: '220px',
        background: 'linear-gradient(160deg, #1a0e06, #120a04)',
        borderTop: '3px solid #8b5e2e',
        borderLeft: '3px solid #8b5e2e',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,180,80,0.05)',
        padding: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '6px',
        boxSizing: 'border-box',
      }}
    >
      <ActionButton
        icon="👻"
        label="고스트 판매"
        count={ghostUnits.length}
        mineralValue={ghostMineral}
        onClick={() => handleSell('Ghost', ghostUnits, ghostMineral)}
      />
      <ActionButton
        icon="🤖"
        label="드라군 판매"
        count={dragoonUnits.length}
        mineralValue={dragoonMineral}
        onClick={() => handleSell('Dragoon', dragoonUnits, dragoonMineral)}
      />
      <ActionButton
        icon="🦎"
        label="히드라 판매"
        count={hydraUnits.length}
        mineralValue={hydraMineral}
        onClick={() => handleSell('Hydra', hydraUnits, hydraMineral)}
      />

      <ActionButton
        icon="✨"
        label="유닛 합성"
        count={combinableUnits.length}
        mineralValue={0}
        onClick={handleCombine}
        disabled={combinableUnits.length < 3}
      />
      <ActionButton
        icon="💎"
        label="유닛 뽑기 (G)"
        count={1}
        mineralValue={0}
        onClick={() => setGachaModalOpen(true)}
      />
      <ActionButton
        icon="🟢"
        label="직업 강화 (U)"
        count={1}
        mineralValue={0}
        onClick={() => setUpgradeModalOpen(true)}
      />
    </div>
  );
};

export default ActionMenuOverlay;
