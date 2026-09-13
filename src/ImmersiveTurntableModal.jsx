import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Disc, 
  Sliders, 
  Gauge, 
  RotateCw, 
  Sparkles, 
  Volume2 
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { getTrackArtwork, handleArtworkError } from '../utils/artwork';

const ImmersiveTurntableModal = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  togglePlay,
  playNext,
  playPrevious,
  currentTime = 0,
  duration = 0,
  seek,
  trackBpm = 85,
  rotationDuration = 5.6
}) => {
  const { t } = useTranslation();

  // 3D 카메라 앵글 상태
  const [tiltAngle, setTiltAngle] = useState(54); // X축 틸트 각도 (35~70도)
  const [rotateZAngle, setRotateZAngle] = useState(-22); // Z축 회전 각도 (-45~0도)
  const [isSpeedBoost, setIsSpeedBoost] = useState(false); // 33 RPM vs 45 RPM

  // 드래그 제스처로 3D 각도 미세 튜닝
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !currentTrack) return null;

  const trackArtwork = getTrackArtwork(currentTrack);

  // 회전 속도 계산 (45 RPM 모드 또는 BPM 기반 회전)
  const effectiveRevDuration = isSpeedBoost 
    ? Math.max(1.8, Number((rotationDuration * 0.72).toFixed(2)))
    : rotationDuration;

  const formatTime = (time) => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.no-drag')) return;
    isDraggingRef.current = true;
    dragStartPosRef.current = {
      x: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
      y: e.clientY ?? e.touches?.[0]?.clientY ?? 0,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const deltaX = clientX - dragStartPosRef.current.x;
    const deltaY = clientY - dragStartPosRef.current.y;

    setRotateZAngle(prev => Math.max(-40, Math.min(-5, -22 + deltaX * 0.05)));
    setTiltAngle(prev => Math.max(35, Math.min(68, 54 - deltaY * 0.05)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#07090e] text-[#f1f5f9] select-none overflow-hidden animate-fade-in"
      style={{ fontFamily: 'var(--app-font-family)' }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* 1. 배경 앰비언트 글로우 & 비네팅 */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10 transition-colors duration-1000"
        style={{
          background: 'radial-gradient(circle at 65% 35%, rgba(var(--theme-primary-rgb) / 0.18) 0%, rgba(var(--theme-secondary-rgb) / 0.08) 45%, transparent 75%)'
        }}
      />
      <div className="absolute top-0 right-0 w-[55vw] h-[55vh] bg-gradient-to-bl from-primary/15 via-secondary/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 2. 상단 미니멀 헤더 */}
      <header className="relative z-30 w-full px-6 pt-5 pb-3 flex items-center justify-between backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90 border border-white/10 shadow-sm group"
            title={t('turntable_close') || '닫기'}
          >
            <ChevronDown className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <div>
            <span 
              className="text-[10px] tracking-[0.3em] font-bold uppercase block"
              style={{ color: 'var(--theme-primary)' }}
            >
              {t('turntable_immersive_view') || '3D Turntable View'}
            </span>
            <h1 className="text-sm font-semibold tracking-wide text-white/90">
              {currentTrack.mood || 'Vibe Session'}
            </h1>
          </div>
        </div>

        {/* 바늘 상태 뱃지 & RPM 토글 */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-white/70">
            <span 
              className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-amber-400'}`} 
            />
            <span>
              {isPlaying 
                ? (t('turntable_tonearm_playing') || '바늘 안착 (재생 중)') 
                : (t('turntable_tonearm_lifted') || '톤암 올림 (정지)')}
            </span>
          </span>

          <button
            onClick={() => setIsSpeedBoost(prev => !prev)}
            className="no-drag px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-1"
            style={{ color: isSpeedBoost ? 'var(--theme-secondary)' : 'var(--theme-primary)' }}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isSpeedBoost ? '45 RPM' : '33 RPM'}</span>
          </button>
        </div>
      </header>

      {/* 3. 메인 3D 턴테이블 씬 뷰포트 */}
      <main 
        className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center"
        style={{ perspective: '1100px', perspectiveOrigin: '50% 42%' }}
      >
        {/* 턴테이블 3D 월드 (사선 앵글: 사진과 동일한 원근 투시각) */}
        <div 
          className="relative w-[680px] h-[680px] sm:w-[760px] sm:h-[760px] -translate-x-[60px] sm:-translate-x-[80px] translate-y-[40px] sm:translate-y-[60px] will-change-transform transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tiltAngle}deg) rotateY(6deg) rotateZ(${rotateZAngle}deg) scale(1.15)`
          }}
        >
          {/* 플린스 섀도우 (턴테이블 하부 바디) */}
          <div 
            className="absolute inset-[-40px] rounded-[48px] bg-gradient-to-br from-[#1b1e26] via-[#101319] to-[#07090c] shadow-[0_50px_120px_rgba(0,0,0,0.98)] border border-white/5 pointer-events-none"
            style={{ transform: 'translateZ(-45px)' }}
          />

          {/* 턴테이블 메탈 플래터 베이스 & 림 (두께감 원통 레이어) */}
          <div 
            className="absolute inset-0 rounded-full bg-[#171b24] shadow-[0_40px_100px_rgba(0,0,0,0.95)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 플래터 하단 림 두께 */}
            <div 
              className="absolute inset-[-8px] rounded-full bg-gradient-to-b from-[#334155] via-[#0f172a] to-[#020617] shadow-[0_25px_50px_rgba(0,0,0,0.95)]"
              style={{ transform: 'translateZ(-28px)' }}
            />
            {/* 플래터 상단 림 두께 */}
            <div 
              className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-[#475569] via-[#1e293b] to-[#334155] shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
              style={{ transform: 'translateZ(-16px)' }}
            />
            
            {/* 은색 알루미늄 베벨 림 광택 링 */}
            <div className="absolute inset-[-2px] rounded-full border-[6px] border-[#94a3b8]/40 shadow-inner" />
            <div className="absolute inset-[3px] rounded-full border-[2px] border-white/20" />

            {/* 4. 회전하는 LP 디스크 (Vinyl Record) */}
            <div 
              className={`absolute inset-[8px] rounded-full shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden flex items-center justify-center transition-all ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{
                background: 'radial-gradient(circle at center, #111115 0%, #18181d 18%, #0c0c0e 22%, #1c1d22 35%, #090a0d 48%, #1a1b20 65%, #070709 82%, #15161a 98%, #2a2c33 100%)',
                animationDuration: `${effectiveRevDuration}s`,
                animationPlayState: isPlaying ? 'running' : 'paused',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* LP 소리골 (Grooves) */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none opacity-80"
                style={{
                  background: 'repeating-radial-gradient(circle at center, rgba(255, 255, 255, 0.035) 0px, rgba(255, 255, 255, 0.035) 1px, transparent 2px, transparent 4px)',
                  mixBlendMode: 'screen'
                }}
              />

              {/* LP 특유의 비등방성 빛 반사 (Anisotropic Sheen / 나비넥타이 하이라이트) */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'conic-gradient(from 35deg at 50% 50%, rgba(255, 255, 255, 0.16) 0deg, transparent 35deg, rgba(255, 255, 255, 0.03) 90deg, transparent 145deg, rgba(255, 255, 255, 0.18) 180deg, transparent 215deg, rgba(255, 255, 255, 0.03) 270deg, transparent 325deg, rgba(255, 255, 255, 0.16) 360deg)',
                  mixBlendMode: 'overlay'
                }}
              />

              {/* 런아웃 그루브 링 */}
              <div className="absolute inset-[38%] rounded-full border border-white/10 pointer-events-none" />

              {/* 5. LP 중앙 원형 라벨 (앨범 이미지 또는 빈티지 라벨) */}
              <div 
                className="absolute inset-[32%] rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.7),0_0_20px_rgba(0,0,0,0.85)] border-[3px] border-[#1e293b] flex flex-col items-center justify-center overflow-hidden bg-surface-container-high z-10"
              >
                {trackArtwork ? (
                  <img 
                    src={trackArtwork} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    onError={(e) => handleArtworkError(e, currentTrack, (img) => {
                      if (img.nextSibling) img.nextSibling.style.display = 'flex';
                    })}
                  />
                ) : null}

                {/* 앨범 이미지가 없을 때 레트로 빈티지 라벨 폴백 */}
                <div 
                  className={`w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-tr from-rose-600 via-rose-400 to-amber-200 text-rose-950 ${
                    trackArtwork ? 'hidden' : 'flex'
                  }`}
                >
                  <span className="text-[7px] font-black tracking-[0.2em] uppercase opacity-75">STEREO 33⅓</span>
                  <span className="text-[10px] font-bold leading-tight mt-1 line-clamp-1">
                    {currentTrack.title || 'Moodify Vinyl'}
                  </span>
                  <span className="text-[7px] font-medium tracking-wider uppercase opacity-80 mt-0.5 line-clamp-1">
                    {currentTrack.artist || 'Original Vibe'}
                  </span>
                </div>

                {/* 센터 스핀들 구멍 & 핀홀 */}
                <div className="absolute w-4 h-4 rounded-full bg-[#090b10] border-2 border-zinc-400 shadow-inner flex items-center justify-center z-20">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                </div>
              </div>
            </div>

            {/* 센터 크롬 스핀들 핀 (디스크 위로 솟은 3D 금속 기둥) */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-t from-zinc-500 to-zinc-200 border border-white/60 shadow-[0_4px_10px_rgba(0,0,0,0.8)] pointer-events-none z-20"
              style={{ transform: 'translateZ(8px)' }}
            />
          </div>

          {/* 6. 정교한 아날로그 3D 톤암 시스템 (Gimbal Base, S-Pipe, Headshell, Finger-Lift, Stylus & Reflection) */}
          <div 
            className="absolute top-[-35px] right-[-50px] w-[390px] h-[470px] pointer-events-none z-30"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* (1) 3D 피봇 베이스 타워 */}
            <div className="tonearm-base-column" style={{ transformStyle: 'preserve-3d' }}>
              <div 
                className="absolute rounded-full bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] border border-[#475569]/50 shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
                style={{ left: 258, top: 38, width: 84, height: 84, transform: 'translateZ(4px)' }}
              />
              <div 
                className="absolute rounded-full bg-gradient-to-tr from-[#334155] via-[#1e293b] to-[#475569] border border-white/20 shadow-lg flex items-center justify-center"
                style={{ left: 268, top: 48, width: 64, height: 64, transform: 'translateZ(14px)' }}
              >
                <div className="absolute -left-3 top-6 w-8 h-2 bg-[#020617] rounded-full border border-[#475569]" />
                <div 
                  className="absolute -left-4 top-4 w-2.5 h-6 bg-gradient-to-t from-zinc-600 to-zinc-200 rounded-sm shadow transition-transform duration-500"
                  style={{ 
                    transformOrigin: 'bottom center',
                    transform: isPlaying ? 'rotate(8deg)' : 'rotate(-15deg)'
                  }}
                />
              </div>
              <div 
                className="absolute rounded-full bg-zinc-900 border border-zinc-600 shadow-inner"
                style={{ left: 334, top: 58, width: 18, height: 18, transform: 'translateZ(16px)' }}
              >
                <div className="w-1 h-2 bg-teal-400 mx-auto mt-0.5 rounded-full" />
              </div>
              <div 
                className="absolute flex flex-col items-center"
                style={{ left: 336, top: 120, transform: 'translateZ(20px)' }}
              >
                <div className="w-3.5 h-7 bg-gradient-to-b from-[#475569] to-[#0f172a] rounded-t-md border border-white/10 flex items-center justify-center">
                  <div className="w-2.5 h-2 bg-[#090b10] rounded-sm" />
                </div>
                <div className="w-4 h-1.5 bg-[#1e293b] rounded-full mt-[-2px]" />
              </div>
            </div>

            {/* (2) 수평 회전(Yaw) 축 */}
            <div 
              className="absolute inset-0 transition-transform duration-700 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: '300px 80px',
                transform: `rotate(${isPlaying ? (6 + (duration > 0 ? (currentTime / duration) : 0.38) * (-14 - 6)) : 26}deg)`
              }}
            >
              {/* 후면 원통형 카운터웨이트 (무게추) */}
              <div className="absolute" style={{ left: 284, top: 14, transformStyle: 'preserve-3d', transform: 'translateZ(26px)' }}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.85)] flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center text-[5px] text-teal-300 font-mono font-bold tracking-tighter">
                    1.75
                  </div>
                </div>
              </div>

              {/* (3) 유압식 수직 승강(Pitch) 축 */}
              <div 
                className="absolute inset-0 transition-transform duration-700 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: '300px 80px',
                  transform: isPlaying ? 'translateZ(4px) rotateX(0deg)' : 'translateZ(26px) rotateX(-5.2deg)'
                }}
              >
                <svg viewBox="0 0 390 470" className="w-full h-full filter drop-shadow-[18px_30px_35px_rgba(0,0,0,0.95)]">
                  <defs>
                    <linearGradient id="chrome-pipe-cylindrical-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="20%" stopColor="#e2e8f0" />
                      <stop offset="42%" stopColor="#64748b" />
                      <stop offset="65%" stopColor="#1e293b" />
                      <stop offset="85%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>

                    <linearGradient id="headshell-body-metal-modal" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="40%" stopColor="#0f172a" />
                      <stop offset="80%" stopColor="#090b10" />
                      <stop offset="100%" stopColor="#020617" />
                    </linearGradient>

                    <linearGradient id="cantilever-grad-modal" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f1f5f9" />
                      <stop offset="60%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                  </defs>

                  {/* 짐벌 링 하우징 */}
                  <g transform="translate(300, 80)">
                    <circle cx="0" cy="0" r="22" fill="#090b10" stroke="#334155" strokeWidth="2.5" />
                    <circle cx="0" cy="0" r="15" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="8" fill="url(#chrome-pipe-cylindrical-modal)" />
                    <circle cx="0" cy="0" r="3" fill="#020617" />
                  </g>

                  {/* 유압 큐잉 리프트 레일 */}
                  <path d="M 280 126 C 294 135, 308 135, 324 126" fill="none" stroke="#020617" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M 281 125 C 294 134, 308 134, 323 125" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />

                  {/* S자형 크롬 톤암 파이프 본체 */}
                  <path 
                    d="M 300 80 C 298 120, 314 175, 312 215 C 310 255, 276 300, 240 335 L 186 372" 
                    fill="none" 
                    stroke="url(#chrome-pipe-cylindrical-modal)" 
                    strokeWidth="9.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  {/* 고광택 하이라이트 릿지 */}
                  <path 
                    d="M 299 81 C 297 120, 313 175, 311 215 C 309 254, 275 299, 239 334 L 185 371" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    opacity="0.85"
                  />

                  {/* 헤드셸 연결 칼라 링 */}
                  <g transform="translate(186, 372) rotate(32)">
                    <rect x="-4" y="-7" width="8" height="14" rx="1.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                  </g>

                  {/* 헤드셸, 카트리지, 스타일러스, 핑거 리프트 */}
                  <g transform="translate(178, 378) rotate(30)">
                    {/* 카트리지 섀도우 */}
                    <ellipse cx="6" cy="46" rx="20" ry="7" fill="#000000" opacity={isPlaying ? 0.85 : 0.25} />

                    {/* LP 거울 반사 (Mirror Reflection) */}
                    <g 
                      transform="translate(0, 42) scale(1, -0.65)" 
                      opacity={isPlaying ? 0.65 : 0.05} 
                      className="transition-opacity duration-500"
                    >
                      <polygon points="-8,0 8,0 6,18 -6,18" fill="url(#headshell-body-metal-modal)" opacity="0.45" />
                      <line x1="0" y1="18" x2="1" y2="28" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
                      <circle cx="1" cy="28" r="2" fill="#67e8f9" opacity="0.9" />
                    </g>

                    {/* 헤드셸 본체 (직사각형 매트 블랙) */}
                    <rect x="-11" y="0" width="22" height="42" rx="3.5" fill="url(#headshell-body-metal-modal)" stroke="#475569" strokeWidth="1.2" />
                    <rect x="-9" y="2" width="18" height="38" rx="2" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                    {/* 카트리지 고정 볼트 2개 */}
                    <circle cx="-4.5" cy="14" r="2.8" fill="#e2e8f0" stroke="#1e293b" strokeWidth="0.5" />
                    <circle cx="4.5" cy="14" r="2.8" fill="#e2e8f0" stroke="#1e293b" strokeWidth="0.5" />

                    {/* ★ 유선형 크롬 핑거 리프트 (Finger Lift) */}
                    <path 
                      d="M 11 12 C 19 13, 27 8, 31 16 C 34 22, 27 28, 22 25" 
                      fill="none" 
                      stroke="url(#chrome-pipe-cylindrical-modal)" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 11 11 C 19 12, 27 7, 30 15 C 33 21, 27 27, 22 24" 
                      fill="none" 
                      stroke="#ffffff" 
                      strokeWidth="1.2" 
                      strokeLinecap="round" 
                      opacity="0.9" 
                    />

                    {/* 카트리지 본체 & 스타일러스 바늘 */}
                    <polygon points="-9,26 9,26 7,42 -7,42" fill="#090b10" stroke="#334155" strokeWidth="1" />
                    <line x1="0" y1="38" x2="0" y2="47" stroke="url(#cantilever-grad-modal)" strokeWidth="2.2" strokeLinecap="round" />
                    <polygon points="-1.5,46 1.5,46 0,51" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.5" />
                    <circle cx="0" cy="51" r="2" fill="#38bdf8" opacity={isPlaying ? 1 : 0.3} />
                    <circle cx="0" cy="51" r="0.8" fill="#ffffff" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 7. 하단 인터랙티브 컨트롤 패널 */}
      <footer className="relative z-30 w-full px-6 py-4 backdrop-blur-xl bg-black/45 border-t border-white/10 flex flex-col gap-3">
        
        {/* 재생 진행 시크바 */}
        <div className="w-full max-w-2xl mx-auto flex items-center gap-3">
          <span className="text-[11px] font-mono text-white/50 w-9 text-right">
            {formatTime(currentTime)}
          </span>
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              if (duration > 0 && seek) {
                seek(clickPos * duration);
              }
            }}
            className="no-drag relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
          >
            <div 
              className="h-full rounded-full relative transition-all duration-150"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))'
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_white]" />
            </div>
          </div>
          <span className="text-[11px] font-mono text-white/50 w-9">
            {formatTime(duration)}
          </span>
        </div>

        <div className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* 현재 곡 정보 */}
          <div className="flex items-center gap-3 min-w-[200px] flex-1 sm:flex-none">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow-inner border border-white/10"
              style={{
                backgroundColor: 'rgb(var(--theme-primary-rgb) / 0.15)',
                color: 'var(--theme-primary)'
              }}
            >
              <Disc className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            </div>
            <div className="overflow-hidden max-w-[220px]">
              <h2 className="text-sm font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </h2>
              <p className="text-xs text-white/60 truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* 메인 컨트롤러 (이전곡 / 재생-일시정지 / 다음곡) */}
          <div className="flex items-center gap-4 mx-auto">
            <button
              onClick={playPrevious}
              className="no-drag w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all active:scale-90"
              title="이전 곡"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="no-drag w-14 h-14 rounded-full flex items-center justify-center text-slate-950 font-black shadow-[0_0_25px_rgb(var(--theme-primary-rgb)_/_0.6)] hover:scale-105 active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(to bottom right, var(--theme-primary), var(--theme-secondary))'
              }}
              title={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="no-drag w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all active:scale-90"
              title="다음 곡"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* 3D 카메라 앵글 슬라이더 */}
          <div className="flex items-center gap-2.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] text-white/50 font-medium">
                <span>{t('turntable_camera_tilt') || '카메라 앵글'}</span>
                <span className="font-mono" style={{ color: 'var(--theme-primary)' }}>{Math.round(tiltAngle)}°</span>
              </div>
              <input
                type="range"
                min="35"
                max="68"
                value={tiltAngle}
                onChange={(e) => setTiltAngle(Number(e.target.value))}
                className="no-drag w-24 sm:w-28 h-1 bg-white/20 rounded-lg cursor-pointer"
                style={{ accentColor: 'var(--theme-primary)' }}
              />
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default ImmersiveTurntableModal;
